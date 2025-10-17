import { applyCatalyst } from "./catalyst";
import { mergeCells } from "./merge";
import { cloneGrid, createEmptyCell, type Grid } from "../grid/grid";
import { isAlive } from "../grid/cell";

export type Direction = "up" | "down" | "left" | "right";

export interface SwipeResult {
  grid: Grid;
  merges: number;
  moved: boolean;
}

export interface SwipeOptions {
  eCap?: number;
  colonyBonus?: boolean;
  colonySizeThreshold?: number;
}

const DEFAULT_OPTIONS: Required<SwipeOptions> = {
  eCap: 8,
  colonyBonus: false,
  colonySizeThreshold: 4
};

const directionVectors: Record<Direction, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 }
};

export function applySwipe(grid: Grid, direction: Direction, options?: SwipeOptions): SwipeResult {
  const config: Required<SwipeOptions> = { ...DEFAULT_OPTIONS, ...options };
  const colonyEligible = config.colonyBonus
    ? computeColonyEligible(grid, config.colonySizeThreshold)
    : new Set<string>();

  const workingGrid = cloneGrid(grid);
  annotateColonyEligible(workingGrid, colonyEligible);

  const rows = workingGrid.length;
  const cols = rows > 0 ? workingGrid[0].length : 0;

  let totalMerges = 0;
  let anyMoved = false;

  const processCell = (row: number, col: number) => {
    const { merges, moved } = slideCell(workingGrid, row, col, direction, config);
    totalMerges += merges;
    anyMoved = anyMoved || moved;
  };

  if (direction === "left") {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        processCell(row, col);
      }
    }
  } else if (direction === "right") {
    for (let row = 0; row < rows; row += 1) {
      for (let col = cols - 1; col >= 0; col -= 1) {
        processCell(row, col);
      }
    }
  } else if (direction === "up") {
    for (let col = 0; col < cols; col += 1) {
      for (let row = 0; row < rows; row += 1) {
        processCell(row, col);
      }
    }
  } else if (direction === "down") {
    for (let col = 0; col < cols; col += 1) {
      for (let row = rows - 1; row >= 0; row -= 1) {
        processCell(row, col);
      }
    }
  }

  return {
    grid: workingGrid,
    merges: totalMerges,
    moved: anyMoved
  };
}

interface SlideResult {
  merges: number;
  moved: boolean;
}

interface InternalSwipeOptions extends Required<SwipeOptions> {}

function slideCell(
  grid: Grid,
  startRow: number,
  startCol: number,
  direction: Direction,
  options: InternalSwipeOptions
): SlideResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  if (rows === 0 || cols === 0) {
    return { merges: 0, moved: false };
  }

  let movingCell = grid[startRow][startCol];
  if (!isAlive(movingCell)) {
    return { merges: 0, moved: false };
  }

  const vector = directionVectors[direction];
  let currentRow = startRow;
  let currentCol = startCol;
  let merges = 0;
  let moved = false;

  while (true) {
    const nextRow = currentRow + vector.dr;
    const nextCol = currentCol + vector.dc;

    if (!inBounds(nextRow, nextCol, rows, cols)) {
      break;
    }

    const targetCell = grid[nextRow][nextCol];

    if (targetCell.state === "empty") {
      grid[nextRow][nextCol] = movingCell;
      grid[currentRow][currentCol] = createEmptyCell();
      currentRow = nextRow;
      currentCol = nextCol;
      moved = true;
      continue;
    }

    if (targetCell.state === "catalyst") {
      const powered = applyCatalyst(movingCell, options.eCap);
      powered.mergedThisSwipe = movingCell.mergedThisSwipe;
      powered.colonyEligible = movingCell.colonyEligible;
      grid[nextRow][nextCol] = powered;
      grid[currentRow][currentCol] = createEmptyCell();
      movingCell = powered;
      currentRow = nextRow;
      currentCol = nextCol;
      moved = true;
      continue;
    }

    if (targetCell.state === "alive" || targetCell.state === "dormant") {
      if (targetCell.mergedThisSwipe) {
        break;
      }

      const colonyBonusEligible =
        options.colonyBonus &&
        Boolean(movingCell.colonyEligible) &&
        Boolean(targetCell.colonyEligible);

      const merged = mergeCells(movingCell, targetCell, {
        eCap: options.eCap,
        colonyBonusEligible
      });

      merged.colonyEligible = false;
      grid[nextRow][nextCol] = merged;
      grid[currentRow][currentCol] = createEmptyCell();
      movingCell = merged;
      currentRow = nextRow;
      currentCol = nextCol;
      merges += 1;
      moved = true;
      break;
    }

    // Treat other states (e.g., blight) as blockers.
    break;
  }

  grid[currentRow][currentCol] = movingCell;
  return { merges, moved };
}

function inBounds(row: number, col: number, rows: number, cols: number): boolean {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function computeColonyEligible(grid: Grid, threshold: number): Set<string> {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const eligible = new Set<string>();

  const neighbors = [
    { dr: 1, dc: 0 },
    { dr: -1, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 0, dc: -1 }
  ];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (visited[row][col]) {
        continue;
      }
      const cell = grid[row][col];
      if (cell.state !== "alive") {
        visited[row][col] = true;
        continue;
      }

      const stack: Array<{ row: number; col: number }> = [{ row, col }];
      const component: Array<{ row: number; col: number }> = [];

      visited[row][col] = true;

      while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
          break;
        }
        component.push(current);

        for (const { dr, dc } of neighbors) {
          const nr = current.row + dr;
          const nc = current.col + dc;
          if (!inBounds(nr, nc, rows, cols) || visited[nr][nc]) {
            continue;
          }
          const neighborCell = grid[nr][nc];
          if (neighborCell.state !== "alive") {
            visited[nr][nc] = true;
            continue;
          }
          visited[nr][nc] = true;
          stack.push({ row: nr, col: nc });
        }
      }

      if (component.length >= threshold) {
        for (const position of component) {
          eligible.add(coordKey(position.row, position.col));
        }
      }
    }
  }

  return eligible;
}

function annotateColonyEligible(grid: Grid, eligible: Set<string>): void {
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      const cell = grid[row][col];
      if (!isAlive(cell)) {
        continue;
      }
      cell.colonyEligible = eligible.has(coordKey(row, col));
      cell.mergedThisSwipe = false;
    }
  }
}

function coordKey(row: number, col: number): string {
  return `${row}:${col}`;
}

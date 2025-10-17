import {
  cloneCell,
  createDormantCell,
  isAlive
} from "../grid/cell";
import type { Grid } from "../grid/grid";

export interface DormancyConfig {
  threshold: number;
}

export interface DormancyResult {
  grid: Grid;
  converted: number;
}

export interface DormancyContext {
  bornPositions?: Set<string>;
}

export function updateDormancy(
  grid: Grid,
  config: DormancyConfig,
  context: DormancyContext = {}
): DormancyResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  let converted = 0;

  const bornPositions = context.bornPositions ?? new Set<string>();

  const nextGrid: Grid = Array.from({ length: rows }, (_, row) => {
    return Array.from({ length: cols }, (__, col) => {
      const cell = grid[row][col];
      if (!isAlive(cell)) {
        if (cell.state === "dormant") {
          const dormantClone = cloneCell(cell);
          dormantClone.mergedThisSwipe = false;
          dormantClone.noMergeTicks = 0;
          return dormantClone;
        }
        return cloneCell(cell);
      }

      const nextCell = cloneCell(cell);
      nextCell.mergedThisSwipe = false;

      if (nextCell.energy > 1) {
        nextCell.noMergeTicks = 0;
        return nextCell;
      }

      const previousCounter = nextCell.noMergeTicks ?? 0;
      if (bornPositions.has(coordKey(row, col))) {
        nextCell.noMergeTicks = 0;
        return nextCell;
      }

      if (cell.mergedThisSwipe) {
        nextCell.noMergeTicks = 0;
        return nextCell;
      }

      const updatedCounter = previousCounter + 1;
      if (updatedCounter >= config.threshold) {
        converted += 1;
        const dormantCell = createDormantCell(1);
        dormantCell.mergedThisSwipe = false;
        dormantCell.noMergeTicks = 0;
        return dormantCell;
      }

      nextCell.noMergeTicks = updatedCounter;
      return nextCell;
    });
  });

  return { grid: nextGrid, converted };
}

function coordKey(row: number, col: number): string {
  return `${row}:${col}`;
}

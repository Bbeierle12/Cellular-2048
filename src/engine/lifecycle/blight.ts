import {
  createDormantCell,
  createEmptyCell,
  isAlive,
  isBlight
} from "../grid/cell";
import { cloneGrid, type Grid } from "../grid/grid";
import type { LifeTickOptions } from "./life-tick";

export interface BlightStepConfig {
  lifeOptions: LifeTickOptions;
}

export interface BlightStepResult {
  grid: Grid;
  conversions: number;
}

export function applyBlight(grid: Grid, config: BlightStepConfig): BlightStepResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const nextGrid = cloneGrid(grid);
  let conversions = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = grid[row][col];
      if (!isBlight(cell)) {
        continue;
      }

      const charges = cell.hazardCharges ?? 1;
      const neighbors = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 }
      ];

      for (const { dr, dc } of neighbors) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
          continue;
        }
        const target = grid[nr][nc];
        if (!isAlive(target)) {
          continue;
        }
        if (isShielded(grid, nr, nc, config.lifeOptions)) {
          continue;
        }

        conversions += 1;
        const dormant = createDormantCell(target.energy);
        dormant.mergedThisSwipe = false;
        nextGrid[nr][nc] = dormant;
      }

      const remainingCharges = charges - 1;
      if (remainingCharges <= 0) {
        nextGrid[row][col] = createEmptyCell();
      } else {
        nextGrid[row][col] = {
          ...nextGrid[row][col],
          hazardCharges: remainingCharges
        };
      }
    }
  }

  return { grid: nextGrid, conversions };
}

const DEFAULT_SURVIVAL = new Set([2, 3]);

function isShielded(
  grid: Grid,
  targetRow: number,
  targetCol: number,
  lifeOptions: LifeTickOptions
): boolean {
  const survivalSet = new Set(lifeOptions.survivalNeighbors ?? DEFAULT_SURVIVAL);
  const birthSet = new Set(lifeOptions.birthNeighbors);

  const size = 5;
  const half = Math.floor(size / 2);
  const initial: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  for (let dr = -half; dr <= half; dr += 1) {
    for (let dc = -half; dc <= half; dc += 1) {
      const sampleRow = targetRow + dr;
      const sampleCol = targetCol + dc;
      const snapshotRow = dr + half;
      const snapshotCol = dc + half;
      if (sampleRow < 0 || sampleRow >= grid.length || sampleCol < 0 || sampleCol >= grid[0].length) {
        continue;
      }
      if (isAlive(grid[sampleRow][sampleCol])) {
        initial[snapshotRow][snapshotCol] = true;
      }
    }
  }

  const first = iterateLife(initial, survivalSet, birthSet);
  if (matchesCenter(initial, first)) {
    return true;
  }
  const second = iterateLife(first, survivalSet, birthSet);
  return matchesCenter(initial, second);
}

function iterateLife(
  state: boolean[][],
  survival: Set<number>,
  birth: Set<number>
): boolean[][] {
  const rows = state.length;
  const cols = rows > 0 ? state[0].length : 0;
  const next: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const directions = [
    { dr: -1, dc: -1 },
    { dr: -1, dc: 0 },
    { dr: -1, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 }
  ];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      let count = 0;
      for (const { dr, dc } of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
          continue;
        }
        if (state[nr][nc]) {
          count += 1;
        }
      }

      if (state[row][col]) {
        next[row][col] = survival.has(count);
      } else {
        next[row][col] = birth.has(count);
      }
    }
  }

  return next;
}

function matchesCenter(a: boolean[][], b: boolean[][]): boolean {
  const start = 1;
  const end = b.length - 1;
  for (let row = start; row < end; row += 1) {
    for (let col = start; col < end; col += 1) {
      if (a[row][col] !== b[row][col]) {
        return false;
      }
    }
  }
  return true;
}

import { cloneGrid, type Grid } from "../grid/grid";
import { createBlightCell, createCatalystCell, isBlight, isCatalyst, isEmpty } from "../grid/cell";

export interface BlightSpawnConfig {
  spawnChance: number;
  linger: number;
  maxTokens?: number;
}

export interface CatalystSpawnConfig {
  spawnChance: number;
  maxCount: number;
}

export interface SpawnResult {
  grid: Grid;
  spawned: number;
}

export type Rng = () => number;

export function spawnBlightTokens(
  grid: Grid,
  config: BlightSpawnConfig,
  rng: Rng
): SpawnResult {
  if (rng() >= config.spawnChance) {
    return { grid, spawned: 0 };
  }

  const nextGrid = cloneGrid(grid);
  const existing = countCells(nextGrid, isBlight);
  const maxTokens = config.maxTokens ?? Number.POSITIVE_INFINITY;
  if (existing >= maxTokens) {
    return { grid, spawned: 0 };
  }

  const empties = collectCells(nextGrid, isEmpty);
  if (empties.length === 0) {
    return { grid, spawned: 0 };
  }

  const index = Math.floor(rng() * empties.length);
  const target = empties[index];
  nextGrid[target.row][target.col] = createBlightCell(config.linger);

  return { grid: nextGrid, spawned: 1 };
}

export function spawnCatalysts(
  grid: Grid,
  config: CatalystSpawnConfig,
  rng: Rng
): SpawnResult {
  if (rng() >= config.spawnChance) {
    return { grid, spawned: 0 };
  }

  const nextGrid = cloneGrid(grid);
  const existing = countCells(nextGrid, isCatalyst);
  if (existing >= config.maxCount) {
    return { grid, spawned: 0 };
  }

  const empties = collectCells(nextGrid, isEmpty);
  if (empties.length === 0) {
    return { grid, spawned: 0 };
  }

  const index = Math.floor(rng() * empties.length);
  const target = empties[index];
  nextGrid[target.row][target.col] = createCatalystCell();

  return { grid: nextGrid, spawned: 1 };
}

type CellPredicate = (cell: Grid[number][number]) => boolean;

function collectCells(grid: Grid, predicate: CellPredicate): Array<{ row: number; col: number }> {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const positions: Array<{ row: number; col: number }> = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (predicate(grid[row][col])) {
        positions.push({ row, col });
      }
    }
  }

  return positions;
}

function countCells(grid: Grid, predicate: CellPredicate): number {
  return collectCells(grid, predicate).length;
}

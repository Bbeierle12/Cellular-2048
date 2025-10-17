import { cloneCell, isAlive } from "../grid/cell";
import type { Grid } from "../grid/grid";
import { NeighborCache } from "../grid/neighbor-cache";

export interface IsolationDecayConfig {
  amount: number;
  minimumEnergy?: number;
}

export interface IsolationDecayResult {
  grid: Grid;
  decayed: number;
}

export function applyIsolationDecay(
  grid: Grid,
  config: IsolationDecayConfig
): IsolationDecayResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const cache = new NeighborCache(grid);
  const minimumEnergy = config.minimumEnergy ?? 1;
  let decayed = 0;

  const nextGrid: Grid = Array.from({ length: rows }, (_, row) => {
    return Array.from({ length: cols }, (_, col) => {
      const cell = grid[row][col];
      if (!isAlive(cell)) {
        return cloneCell(cell);
      }

      const neighbors = cache.getNeighbors(row, col);
      if (neighbors > 1) {
        return cloneCell(cell);
      }

      const nextCell = cloneCell(cell);
      const nextEnergy = Math.max(nextCell.energy - config.amount, minimumEnergy);
      if (nextEnergy !== nextCell.energy) {
        nextCell.energy = nextEnergy;
        decayed += 1;
      }
      return nextCell;
    });
  });

  return { grid: nextGrid, decayed };
}

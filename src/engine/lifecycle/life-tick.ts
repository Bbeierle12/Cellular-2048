import { cloneCell, createAliveCell, createEmptyCell, isAlive } from "../grid/cell";
import type { Grid } from "../grid/grid";
import { NeighborCache } from "../grid/neighbor-cache";

const DEFAULT_SURVIVAL = new Set([2, 3]);

export interface LifeTickOptions {
  birthNeighbors: number[];
  survivalNeighbors?: number[];
}

export interface LifeTickResult {
  grid: Grid;
  births: number;
  deaths: number;
  bornPositions: Set<string>;
}

export function lifeTick(grid: Grid, options: LifeTickOptions): LifeTickResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const cache = new NeighborCache(grid);
  const survivalSet = new Set(options.survivalNeighbors ?? DEFAULT_SURVIVAL);
  const birthSet = new Set(options.birthNeighbors);

  let births = 0;
  let deaths = 0;
  const bornPositions = new Set<string>();

  const nextGrid: Grid = Array.from({ length: rows }, (_, row) => {
    return Array.from({ length: cols }, (_, col) => {
      const cell = grid[row][col];
      const neighbors = cache.getNeighbors(row, col);

      switch (cell.state) {
        case "alive": {
          if (!survivalSet.has(neighbors)) {
            deaths += 1;
            return createEmptyCell();
          }
          const survivor = cloneCell(cell);
          return survivor;
        }
        case "empty": {
          if (birthSet.has(neighbors)) {
            births += 1;
            const newborn = createAliveCell(1);
            bornPositions.add(coordKey(row, col));
            return { ...newborn, noMergeTicks: 0, mergedThisSwipe: false };
          }
          return createEmptyCell();
        }
        case "dormant":
        case "catalyst":
        case "blight":
          return cloneCell(cell);
        default:
          return isAlive(cell) ? cloneCell(cell) : createEmptyCell();
      }
    });
  });

  return { grid: nextGrid, births, deaths, bornPositions };
}

function coordKey(row: number, col: number): string {
  return `${row}:${col}`;
}

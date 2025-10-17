import { cloneCell, createEmptyCell, type Cell } from "./cell";

export type Grid = Cell[][];

export interface GridDimensions {
  rows: number;
  cols: number;
}

export function createGrid({ rows, cols }: GridDimensions, seed: () => number): Grid {
  const grid: Grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => createEmptyCell())
  );

  // TODO: seed starting cells using provided RNG
  seed();
  return grid;
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((cell) => cloneCell(cell)));
}

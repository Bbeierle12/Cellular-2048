import { cloneCell, createEmptyCell, createAliveCell, type Cell } from "./cell";

export type Grid = Cell[][];

export interface GridDimensions {
  rows: number;
  cols: number;
}

export function createGrid({ rows, cols }: GridDimensions, seed: () => number): Grid {
  const grid: Grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => createEmptyCell())
  );

  // Seed 2-4 starting cells with E=1 using provided RNG
  const numStartCells = Math.floor(seed() * 3) + 2; // 2-4 cells
  const maxAttempts = 100; // Prevent infinite loop
  
  for (let i = 0; i < numStartCells && i < maxAttempts; i++) {
    let row = Math.floor(seed() * rows);
    let col = Math.floor(seed() * cols);
    
    // Try to find an empty position
    let attempts = 0;
    while (grid[row][col].state !== "empty" && attempts < maxAttempts) {
      row = Math.floor(seed() * rows);
      col = Math.floor(seed() * cols);
      attempts++;
    }
    
    if (grid[row][col].state === "empty") {
      grid[row][col] = createAliveCell(1);
    }
  }
  
  return grid;
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((cell) => cloneCell(cell)));
}

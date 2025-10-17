import type { Cell } from "./cell";
import { isAlive } from "./cell";

export type NeighborCount = number;

export class NeighborCache {
  private readonly counts: NeighborCount[][];

  constructor(private readonly grid: Cell[][]) {
    this.counts = this.computeNeighborCounts();
  }

  // TODO: implement incremental neighbor counting across swipes and ticks.
  getNeighbors(row: number, col: number): NeighborCount {
    if (row < 0 || col < 0 || row >= this.counts.length) {
      return 0;
    }
    const rowCounts = this.counts[row] ?? [];
    return rowCounts[col] ?? 0;
  }

  private computeNeighborCounts(): NeighborCount[][] {
    const rows = this.grid.length;
    const cols = rows > 0 ? this.grid[0].length : 0;
    const counts: NeighborCount[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

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
        const cell = this.grid[row][col];
        if (!isAlive(cell)) {
          continue;
        }

        for (const { dr, dc } of directions) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
            continue;
          }
          counts[nr][nc] += 1;
        }
      }
    }

    return counts;
  }
}

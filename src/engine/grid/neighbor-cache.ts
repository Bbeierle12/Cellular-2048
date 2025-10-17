import type { Cell } from "./cell";

export type NeighborCount = number;

export class NeighborCache {
  constructor(private readonly grid: Cell[][]) {}

  // TODO: implement incremental neighbor counting across swipes and ticks.
  getNeighbors(row: number, col: number): NeighborCount {
    void row;
    void col;
    return 0;
  }
}

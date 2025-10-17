import type { Grid } from "../grid/grid";

export interface LifeTickOptions {
  birthNeighbors: number[];
}

export function lifeTick(grid: Grid, options: LifeTickOptions): Grid {
  void options;
  // TODO: compute births and deaths referencing neighbor counts.
  return grid;
}

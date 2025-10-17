import type { Grid } from "../grid/grid";

export interface DormancyConfig {
  threshold: number;
}

export function updateDormancy(grid: Grid, config: DormancyConfig): Grid {
  void config;
  // TODO: increment no-merge counters and flip cells to dormant where needed.
  return grid;
}

import type { Grid } from "../grid/grid";

export interface BlightConfig {
  spawnRate: number;
  linger: number;
}

export function applyBlight(grid: Grid, config: BlightConfig): Grid {
  void config;
  // TODO: convert eligible neighbors to dormant while respecting shielding logic.
  return grid;
}

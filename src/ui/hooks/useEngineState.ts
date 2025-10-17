import { useState } from "react";
import type { Grid } from "../../engine/grid/grid";

export function useEngineState(initial: Grid): [Grid, (grid: Grid) => void] {
  return useState<Grid>(initial);
}

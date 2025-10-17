import type { Grid } from "../grid/grid";

export interface ScoreResult {
  totalEnergy: number;
  stabilityIncremented: boolean;
}

export function tallyScore(grid: Grid, hadBirthOrDeath: boolean): ScoreResult {
  const totalEnergy = grid.flat().reduce((sum, cell) => sum + Math.max(cell.energy, 0), 0);
  return {
    totalEnergy,
    stabilityIncremented: !hadBirthOrDeath
  };
}

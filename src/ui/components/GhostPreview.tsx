import type { Grid } from "../../engine/grid/grid";
import type { DifficultyConfig } from "../../state/types";
import { lifeTick } from "../../engine/lifecycle/life-tick";

interface GhostPreviewProps {
  grid: Grid;
  lifeOptions: DifficultyConfig;
}

export function GhostPreview({ grid, lifeOptions }: GhostPreviewProps): JSX.Element | null {
  // Calculate next Life tick for preview
  // For now, just show a toggle hint
  // TODO: Implement full ghost preview rendering
  
  return null; // Hidden for now, will implement in next iteration
}

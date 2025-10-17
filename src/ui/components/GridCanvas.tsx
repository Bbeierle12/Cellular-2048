import { GhostPreview } from "./GhostPreview";
import { EnergyRing } from "./EnergyRing";

export function GameBoard(): JSX.Element {
  // TODO: wire into engine state once implemented.
  return (
    <div className="game-board">
      <GhostPreview />
      <EnergyRing energy={1} />
    </div>
  );
}

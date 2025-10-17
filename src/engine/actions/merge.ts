import { isAlive, isDormant, type Cell } from "../grid/cell";

export interface MergeContext {
  eCap: number;
  colonyBonusEligible: boolean;
}

export function mergeCells(lhs: Cell, rhs: Cell, context: MergeContext): Cell {
  if (!isAlive(lhs) && !isAlive(rhs)) {
    throw new Error("At least one cell must be alive to merge.");
  }

  const aliveCell = isAlive(lhs) ? lhs : rhs;
  const otherCell = aliveCell === lhs ? rhs : lhs;

  let energy: number;

  if (isAlive(otherCell)) {
    if (aliveCell.energy === otherCell.energy) {
      energy = aliveCell.energy + 1;
    } else {
      const higher = Math.max(aliveCell.energy, otherCell.energy);
      energy = Math.max(higher - 1, 1);
    }
  } else if (isDormant(otherCell)) {
    const dormantEnergy = otherCell.energy;
    energy = Math.max(Math.max(aliveCell.energy, dormantEnergy) - 1, 1);
  } else {
    throw new Error(`Cannot merge cell state ${otherCell.state}`);
  }

  if (context.colonyBonusEligible) {
    energy += 1;
  }

  energy = Math.min(energy, context.eCap);

  return {
    state: "alive",
    energy,
    noMergeTicks: 0,
    mergedThisSwipe: true
  };
}

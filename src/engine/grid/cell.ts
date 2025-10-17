export type CellState = "empty" | "alive" | "dormant" | "catalyst" | "blight";

export interface Cell {
  state: CellState;
  energy: number;
  noMergeTicks?: number;
  mergedThisSwipe?: boolean;
  colonyEligible?: boolean;
}

export function createAliveCell(energy: number): Cell {
  return { state: "alive", energy };
}

export function cloneCell(cell: Cell): Cell {
  return { ...cell };
}

export function createEmptyCell(): Cell {
  return { state: "empty", energy: 0 };
}

export function createDormantCell(energy: number): Cell {
  return { state: "dormant", energy, noMergeTicks: 0 };
}

export function createCatalystCell(): Cell {
  return { state: "catalyst", energy: 0 };
}

export function isAlive(cell: Cell): boolean {
  return cell.state === "alive";
}

export function isDormant(cell: Cell): boolean {
  return cell.state === "dormant";
}

export type CellState = "empty" | "alive" | "dormant" | "catalyst" | "blight";

export interface Cell {
  state: CellState;
  energy: number;
  noMergeTicks?: number;
  mergedThisSwipe?: boolean;
  colonyEligible?: boolean;
  hazardCharges?: number;
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

export function createBlightCell(charges = 1): Cell {
  return { state: "blight", energy: 0, hazardCharges: charges };
}

export function isAlive(cell: Cell): boolean {
  return cell.state === "alive";
}

export function isDormant(cell: Cell): boolean {
  return cell.state === "dormant";
}

export function isEmpty(cell: Cell): boolean {
  return cell.state === "empty";
}

export function isBlight(cell: Cell): boolean {
  return cell.state === "blight";
}

export function isCatalyst(cell: Cell): boolean {
  return cell.state === "catalyst";
}

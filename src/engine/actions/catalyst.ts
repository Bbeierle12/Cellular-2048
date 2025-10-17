import type { Cell } from "../grid/cell";

export function applyCatalyst(cell: Cell, cap: number): Cell {
  const doubled = Math.min(cell.energy * 2, cap);
  return { ...cell, energy: doubled };
}

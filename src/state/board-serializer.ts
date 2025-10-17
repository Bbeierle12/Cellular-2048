import type { Grid } from "../engine/grid/grid";
import type { Cell } from "../engine/grid/cell";
import type { BoardSnapshot, SerializedCell } from "./types";
import { isBlight, isCatalyst, isEmpty, isAlive, isDormant } from "../engine/grid/cell";

/**
 * Serializes a grid into a flat array of cells for UI consumption
 */
export function serializeBoard(grid: Grid): BoardSnapshot {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const cells: SerializedCell[] = [];
  
  let aliveCells = 0;
  let dormantCells = 0;
  let blightTokens = 0;
  let catalystTokens = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      const serialized = serializeCell(cell, col, row);
      cells.push(serialized);

      // Count by type
      switch (serialized.kind) {
        case "alive":
          aliveCells++;
          break;
        case "dormant":
          dormantCells++;
          break;
        case "blight":
          blightTokens++;
          break;
        case "catalyst":
          catalystTokens++;
          break;
      }
    }
  }

  return {
    width: cols,
    height: rows,
    cells,
    aliveCells,
    dormantCells,
    blightTokens,
    catalystTokens
  };
}

/**
 * Serializes a single cell
 */
function serializeCell(cell: Cell, x: number, y: number): SerializedCell {
  const base = { x, y };

  if (isEmpty(cell)) {
    return { ...base, kind: "empty", energy: 0 };
  }

  if (isBlight(cell)) {
    return { ...base, kind: "blight", energy: cell.hazardCharges ?? 1 };
  }

  if (isCatalyst(cell)) {
    return { ...base, kind: "catalyst", energy: 0 };
  }

  if (isAlive(cell)) {
    return {
      ...base,
      kind: "alive",
      energy: cell.energy,
      mergedThisSwipe: cell.mergedThisSwipe,
      noMergeTicks: cell.noMergeTicks
    };
  }

  if (isDormant(cell)) {
    return {
      ...base,
      kind: "dormant",
      energy: cell.energy,
      noMergeTicks: cell.noMergeTicks
    };
  }

  // Fallback for unknown cell types
  return { ...base, kind: "empty", energy: 0 };
}

/**
 * Counts total energy on the board (for validation)
 */
export function calculateTotalEnergy(grid: Grid): number {
  let total = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (isAlive(cell)) {
        total += cell.energy;
      }
    }
  }
  return total;
}

/**
 * Checks if board is in a game-over state (no valid moves)
 */
export function isGameOver(grid: Grid): boolean {
  // Game is over if there are no empty cells and no possible merges
  // This is a simplified check; could be enhanced later
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  let hasEmpty = false;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (isEmpty(grid[row][col])) {
        hasEmpty = true;
        break;
      }
    }
    if (hasEmpty) break;
  }

  return !hasEmpty;
}

/**
 * Checks win condition: stable board with energy >= threshold
 */
export function checkWinCondition(
  totalEnergy: number,
  stabilityIncremented: boolean,
  threshold: number
): boolean {
  return stabilityIncremented && totalEnergy >= threshold;
}

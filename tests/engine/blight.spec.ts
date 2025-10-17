import { describe, it, expect } from "vitest";
import { applyBlight } from "../../src/engine/lifecycle/blight";
import type { Grid } from "../../src/engine/grid/grid";
import {
  createAliveCell,
  createBlightCell,
  createEmptyCell
} from "../../src/engine/grid/cell";

describe("applyBlight", () => {
  it("converts unshielded adjacent alive cells to dormant", () => {
    const grid: Grid = [
      [createBlightCell(1), createAliveCell(3), createEmptyCell()],
      [createEmptyCell(), createAliveCell(3), createAliveCell(3)],
      [createEmptyCell(), createEmptyCell(), createEmptyCell()]
    ];

    const result = applyBlight(grid, { lifeOptions: { birthNeighbors: [3] } });

    expect(result.conversions).toBe(1);
    expect(result.grid[0][1].state).toBe("dormant");
    expect(result.grid[0][0].state).toBe("empty");
  });

  it("respects shielding from still-life patterns", () => {
    const grid: Grid = [
      [createBlightCell(1), createAliveCell(1), createAliveCell(1)],
      [createEmptyCell(), createAliveCell(1), createAliveCell(1)],
      [createEmptyCell(), createEmptyCell(), createEmptyCell()]
    ];

    const result = applyBlight(grid, { lifeOptions: { birthNeighbors: [3] } });

    expect(result.conversions).toBe(0);
    expect(result.grid[0][1].state).toBe("alive");
    expect(result.grid[0][0].state).toBe("empty");
  });

  it("retains lingering charges when configured", () => {
    const grid: Grid = [
      [createBlightCell(2), createAliveCell(2), createEmptyCell()],
      [createEmptyCell(), createAliveCell(2), createAliveCell(2)],
      [createEmptyCell(), createEmptyCell(), createEmptyCell()]
    ];

    const result = applyBlight(grid, { lifeOptions: { birthNeighbors: [3] } });

    expect(result.conversions).toBe(1);
    expect(result.grid[0][0].state).toBe("blight");
    expect(result.grid[0][0].hazardCharges).toBe(1);
  });
});

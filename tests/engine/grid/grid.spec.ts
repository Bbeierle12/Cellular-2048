import { describe, expect, it, vi } from "vitest";

import { createAliveCell } from "../../../src/engine/grid/cell";
import { cloneGrid, createGrid, type Grid } from "../../../src/engine/grid/grid";

describe("grid helpers", () => {
  it("creates grids filled with empty cells and invokes seeding rng", () => {
    const seed = vi.fn(() => 0.42);

    const grid = createGrid({ rows: 2, cols: 3 }, seed);

    expect(seed).toHaveBeenCalledTimes(1);
    expect(grid).toHaveLength(2);
    expect(grid[0]).toHaveLength(3);
    expect(grid.every((row) => row.every((cell) => cell.state === "empty"))).toBe(true);
    const flat = grid.flat();
    // every cell should be a distinct reference
    expect(new Set(flat).size).toBe(flat.length);
  });

  it("clones grids deeply", () => {
    const original: Grid = [
      [createAliveCell(2), createAliveCell(3)],
      [createAliveCell(1), createAliveCell(4)]
    ];

    const copy = cloneGrid(original);

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy[0][0]).not.toBe(original[0][0]);
  });
});

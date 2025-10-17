import { describe, expect, it, vi } from "vitest";

import { createAliveCell } from "../../../src/engine/grid/cell";
import { cloneGrid, createGrid, type Grid } from "../../../src/engine/grid/grid";

describe("grid helpers", () => {
  it("creates grids with starting cells and invokes seeding rng", () => {
    // Create a sequence of random values to avoid collisions
    let callCount = 0;
    const values = [0.5, 0.2, 0.8, 0.1, 0.9, 0.3, 0.7, 0.4, 0.6];
    const seed = vi.fn(() => values[callCount++ % values.length]);

    const grid = createGrid({ rows: 2, cols: 3 }, seed);

    expect(seed).toHaveBeenCalled();
    expect(grid).toHaveLength(2);
    expect(grid[0]).toHaveLength(3);
    
    // Should have 2-4 starting alive cells with E=1
    const aliveCells = grid.flat().filter((cell) => cell.state === "alive");
    expect(aliveCells.length).toBeGreaterThanOrEqual(2);
    expect(aliveCells.length).toBeLessThanOrEqual(4);
    expect(aliveCells.every((cell) => cell.energy === 1)).toBe(true);
    
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

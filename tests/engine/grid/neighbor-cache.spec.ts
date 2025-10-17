import { describe, expect, it } from "vitest";

import { createAliveCell, createEmptyCell } from "../../../src/engine/grid/cell";
import { NeighborCache } from "../../../src/engine/grid/neighbor-cache";
import type { Grid } from "../../../src/engine/grid/grid";

const alive = () => createAliveCell(1);
const empty = () => createEmptyCell();

describe("NeighborCache", () => {
  it("counts alive neighbors for interior cells", () => {
    const grid: Grid = [
      [alive(), alive(), alive()],
      [alive(), empty(), alive()],
      [alive(), alive(), alive()]
    ];

    const cache = new NeighborCache(grid);

    expect(cache.getNeighbors(1, 1)).toBe(8);
    expect(cache.getNeighbors(0, 0)).toBe(3);
    expect(cache.getNeighbors(0, 2)).toBe(3);
  });

  it("returns zero for out of bounds queries", () => {
    const grid: Grid = [
      [alive(), empty()],
      [empty(), alive()]
    ];

    const cache = new NeighborCache(grid);

    expect(cache.getNeighbors(-1, 0)).toBe(0);
    expect(cache.getNeighbors(10, 10)).toBe(0);
  });
});

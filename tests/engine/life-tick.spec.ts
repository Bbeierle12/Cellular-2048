import { describe, it, expect } from "vitest";
import type { Grid } from "../../src/engine/grid/grid";
import { createAliveCell, createEmptyCell } from "../../src/engine/grid/cell";
import { lifeTick } from "../../src/engine/lifecycle/life-tick";

const alive = (energy = 1) => createAliveCell(energy);
const empty = () => createEmptyCell();

describe("lifeTick", () => {
  it("applies survival, deaths, and births with standard rules", () => {
    const grid: Grid = [
      [empty(), empty(), empty()],
      [alive(), alive(), alive()],
      [empty(), empty(), empty()]
    ];

    const { grid: next, births, deaths, bornPositions } = lifeTick(grid, { birthNeighbors: [3] });

    expect(deaths).toBe(2);
    expect(births).toBe(2);
    expect(next[1][1].state).toBe("alive");
    expect(next[0][1].state).toBe("alive");
    expect(next[2][1].state).toBe("alive");
    expect(next[1][0].state).toBe("empty");
    expect(next[1][2].state).toBe("empty");
    expect(bornPositions.has("0:1")).toBe(true);
    expect(bornPositions.has("2:1")).toBe(true);
  });

  it("allows relaxed births when configured", () => {
    const grid: Grid = [
      [alive(), alive()],
      [empty(), empty()]
    ];

    const { grid: next, births } = lifeTick(grid, { birthNeighbors: [2, 3] });

    expect(births).toBe(1);
    expect(next[1][1].state).toBe("alive");
  });
});

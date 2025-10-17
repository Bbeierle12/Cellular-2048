import { describe, it, expect } from "vitest";

import { applySwipe } from "../../src/engine/actions/swipe";
import type { Grid } from "../../src/engine/grid/grid";
import {
  createAliveCell,
  createCatalystCell,
  createDormantCell,
  createEmptyCell
} from "../../src/engine/grid/cell";

const alive = (energy: number) => createAliveCell(energy);
const dormant = (energy: number) => createDormantCell(energy);
const empty = () => createEmptyCell();
const catalyst = () => createCatalystCell();

describe("applySwipe", () => {
  it("slides alive cells left into empty spaces", () => {
    const grid: Grid = [[empty(), alive(2), empty(), alive(1)]];

    const { grid: next, moved } = applySwipe(grid, "left");

    expect(moved).toBe(true);
    expect(next[0][0]).toMatchObject({ state: "alive", energy: 2 });
    expect(next[0][1]).toMatchObject({ state: "alive", energy: 1 });
    expect(next[0][2].state).toBe("empty");
    expect(grid[0][1].state).toBe("alive"); // original grid untouched
  });

  it("merges equal-energy tiles and caps at eCap", () => {
    const grid: Grid = [[alive(4), alive(4), empty()]];

    const { grid: next, merges } = applySwipe(grid, "left", { eCap: 5 });

    expect(merges).toBe(1);
    expect(next[0][0]).toMatchObject({ state: "alive", energy: 5, mergedThisSwipe: true });
    expect(next[0][1].state).toBe("empty");
  });

  it("prevents double merges within a single swipe", () => {
    const grid: Grid = [[alive(2), alive(2), alive(2), empty()]];

    const { grid: next } = applySwipe(grid, "left");

    expect(next[0][0]).toMatchObject({ state: "alive", energy: 3 });
    expect(next[0][1]).toMatchObject({ state: "alive", energy: 2 });
    expect(next[0][2].state).toBe("empty");
  });

  it("handles unequal energy merges by reducing the higher tile", () => {
    const grid: Grid = [[alive(5), alive(2), empty()]];

    const { grid: next } = applySwipe(grid, "left");

    expect(next[0][0]).toMatchObject({ state: "alive", energy: 4 });
    expect(next[0][1].state).toBe("empty");
  });

  it("reactivates dormant cells when merged into by an alive cell", () => {
    const grid: Grid = [[dormant(1), alive(3), empty()]];

    const { grid: next } = applySwipe(grid, "left");

    expect(next[0][0]).toMatchObject({ state: "alive", energy: 2, mergedThisSwipe: true });
    expect(next[0][1].state).toBe("empty");
  });

  it("doubles energy when passing through a catalyst tile", () => {
    const grid: Grid = [[empty(), catalyst(), alive(2)]];

    const { grid: next } = applySwipe(grid, "left", { eCap: 10 });

    expect(next[0][0]).toMatchObject({ state: "alive", energy: 4 });
    expect(next[0][1].state).toBe("empty");
  });

  it("applies colony bonus when both participants are eligible", () => {
    const grid: Grid = [
      [alive(1), alive(1), empty()],
      [alive(1), alive(1), empty()],
      [empty(), empty(), empty()]
    ];

    const { grid: next } = applySwipe(grid, "left", { colonyBonus: true, eCap: 10 });

    expect(next[0][0]).toMatchObject({ state: "alive", energy: 3 });
  });
});

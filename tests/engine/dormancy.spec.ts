import { describe, it, expect } from "vitest";
import type { Grid } from "../../src/engine/grid/grid";
import { createAliveCell } from "../../src/engine/grid/cell";
import { updateDormancy } from "../../src/engine/lifecycle/dormancy";

describe("updateDormancy", () => {
  it("converts idle low-energy cells after threshold", () => {
    const grid: Grid = [[{ ...createAliveCell(1), noMergeTicks: 2, mergedThisSwipe: false }]];

    const { grid: next, converted } = updateDormancy(grid, { threshold: 3 });

    expect(converted).toBe(1);
    expect(next[0][0].state).toBe("dormant");
  });

  it("resets counters when cell merged during swipe", () => {
    const grid: Grid = [[{ ...createAliveCell(1), noMergeTicks: 2, mergedThisSwipe: true }]];

    const { grid: next, converted } = updateDormancy(grid, { threshold: 3 });

    expect(converted).toBe(0);
    expect(next[0][0].state).toBe("alive");
    expect(next[0][0].noMergeTicks).toBe(0);
  });

  it("does not increment counters for newborn cells", () => {
    const grid: Grid = [[{ ...createAliveCell(1), noMergeTicks: 0, mergedThisSwipe: false }]];

    const { grid: next } = updateDormancy(grid, { threshold: 3 }, { bornPositions: new Set(["0:0"]) });

    expect(next[0][0].state).toBe("alive");
    expect(next[0][0].noMergeTicks).toBe(0);
  });
});

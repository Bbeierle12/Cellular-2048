import { describe, it, expect } from "vitest";

import type { Grid } from "../../src/engine/grid/grid";
import { createAliveCell, createEmptyCell } from "../../src/engine/grid/cell";
import { applyIsolationDecay } from "../../src/engine/lifecycle/decay";

describe("applyIsolationDecay", () => {
  it("reduces energy for isolated cells", () => {
    const grid: Grid = [
      [createAliveCell(3)]
    ];

    const { grid: next, decayed } = applyIsolationDecay(grid, { amount: 1 });

    expect(decayed).toBe(1);
    expect(next[0][0].energy).toBe(2);
  });

  it("leaves well-connected cells unchanged", () => {
    const grid: Grid = [
      [createAliveCell(2), createAliveCell(2)],
      [createAliveCell(2), createEmptyCell()]
    ];

    const { grid: next, decayed } = applyIsolationDecay(grid, { amount: 1 });

    expect(decayed).toBe(0);
    expect(next[0][0].energy).toBe(2);
    expect(next[0][1].energy).toBe(2);
    expect(next[1][0].energy).toBe(2);
  });
});

import { describe, expect, it } from "vitest";

import { applyIsolationDecay } from "../../src/engine/lifecycle/decay";
import { createAliveCell } from "../../src/engine/grid/cell";

describe("engine invariants", () => {
  it("isolation decay never reduces energy below minimum", () => {
    for (let energy = 1; energy <= 6; energy += 1) {
      const grid = [[createAliveCell(energy)]];
      const { grid: next } = applyIsolationDecay(grid, { amount: 3, minimumEnergy: 1 });
      expect(next[0][0].energy).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not decay cells with sufficient neighbors", () => {
    const grid = [
      [createAliveCell(3), createAliveCell(3)],
      [createAliveCell(3), createAliveCell(3)]
    ];

    const { grid: next, decayed } = applyIsolationDecay(grid, { amount: 2, minimumEnergy: 1 });
    expect(decayed).toBe(0);
    next.flat().forEach((cell) => expect(cell.energy).toBe(3));
  });
});

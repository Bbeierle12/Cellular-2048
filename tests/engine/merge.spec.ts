import { describe, it, expect } from "vitest";

import { mergeCells } from "../../src/engine/actions/merge";
import {
  createAliveCell,
  createDormantCell
} from "../../src/engine/grid/cell";

describe("mergeCells", () => {
  it("increments energy when both cells have equal energy", () => {
    const lhs = createAliveCell(2);
    const rhs = createAliveCell(2);

    const result = mergeCells(lhs, rhs, { eCap: 8, colonyBonusEligible: false });

    expect(result).toMatchObject({ state: "alive", energy: 3, mergedThisSwipe: true });
  });

  it("reduces higher energy cell when energies differ", () => {
    const lhs = createAliveCell(5);
    const rhs = createAliveCell(3);

    const result = mergeCells(lhs, rhs, { eCap: 10, colonyBonusEligible: false });

    expect(result.energy).toBe(4);
  });

  it("reactivates dormant cell with adjusted energy", () => {
    const lhs = createDormantCell(1);
    const rhs = createAliveCell(4);

    const result = mergeCells(lhs, rhs, { eCap: 10, colonyBonusEligible: false });

    expect(result.energy).toBe(3);
  });

  it("applies colony bonus when eligible", () => {
    const lhs = createAliveCell(3);
    const rhs = createAliveCell(3);

    const result = mergeCells(lhs, rhs, { eCap: 10, colonyBonusEligible: true });

    expect(result.energy).toBe(5); // (3 + 1) + bonus 1
  });
});

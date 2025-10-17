import { describe, expect, it } from "vitest";

import { pickIndex } from "../../../src/engine/rng/distributions";

describe("pickIndex", () => {
  const weights = [1, 2, 3];
  const total = weights.reduce((sum, w) => sum + w, 0);

  it("selects the first index when rng returns zero", () => {
    const index = pickIndex(weights, () => 0);
    expect(index).toBe(0);
  });

  it("selects index according to cumulative thresholds", () => {
    // choose a number that lands in the third weight bucket
    const valueInThirdBucket = (weights[0] + weights[1] + weights[2] / 2) / total;
    const index = pickIndex(weights, () => valueInThirdBucket);
    expect(index).toBe(2);
  });

  it("returns the last index when rng is at the upper bound", () => {
    const index = pickIndex(weights, () => 1);
    expect(index).toBe(weights.length - 1);
  });
});

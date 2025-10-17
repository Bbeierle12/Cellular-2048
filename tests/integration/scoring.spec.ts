import { describe, it, expect } from "vitest";
import { tallyScore } from "../../src/engine/scoring";

describe("tallyScore", () => {
  it("sums cell energy", () => {
    const grid = [
      [
        { state: "alive", energy: 2 },
        { state: "alive", energy: 3 }
      ]
    ];
    const result = tallyScore(grid, false);
    expect(result.totalEnergy).toBe(5);
    expect(result.stabilityIncremented).toBe(true);
  });
});

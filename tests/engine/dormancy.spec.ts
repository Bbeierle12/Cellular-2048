import { describe, it, expect } from "vitest";
import { updateDormancy } from "../../src/engine/lifecycle/dormancy";

describe("updateDormancy", () => {
  it("is a placeholder", () => {
    const grid = [[{ state: "alive", energy: 1, noMergeTicks: 0 }]];
    const result = updateDormancy(grid, { threshold: 3 });
    expect(result).toBe(grid);
  });
});

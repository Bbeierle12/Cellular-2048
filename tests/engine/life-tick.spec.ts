import { describe, it, expect } from "vitest";
import { lifeTick } from "../../src/engine/lifecycle/life-tick";

describe("lifeTick", () => {
  it("currently returns grid unchanged", () => {
    const grid = [[{ state: "empty", energy: 0 }]];
    const result = lifeTick(grid, { birthNeighbors: [3] });
    expect(result).toBe(grid);
  });
});

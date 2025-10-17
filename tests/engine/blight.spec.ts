import { describe, it, expect } from "vitest";
import { applyBlight } from "../../src/engine/lifecycle/blight";

describe("applyBlight", () => {
  it("currently does nothing", () => {
    const grid = [[{ state: "alive", energy: 2 }]];
    const result = applyBlight(grid, { spawnRate: 0, linger: 0 });
    expect(result).toBe(grid);
  });
});

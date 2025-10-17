import { describe, it, expect } from "vitest";

import type { Grid } from "../../src/engine/grid/grid";
import { createEmptyCell } from "../../src/engine/grid/cell";
import { spawnBlightTokens, spawnCatalysts } from "../../src/engine/hazards/spawn";

describe("hazard spawning", () => {
  it("spawns a blight token when RNG is below chance", () => {
    const grid: Grid = [
      [createEmptyCell(), createEmptyCell()],
      [createEmptyCell(), createEmptyCell()]
    ];

    const rngValues = [0.1, 0.5];
    const rng = () => rngValues.shift() ?? 0;

    const result = spawnBlightTokens(grid, { spawnChance: 0.5, linger: 2 }, rng);

    expect(result.spawned).toBe(1);
    expect(result.grid.flat().some((cell) => cell.state === "blight")).toBe(true);
  });

  it("respects catalyst capacity", () => {
    const grid: Grid = [
      [createEmptyCell(), createEmptyCell()]
    ];

    const rngValues = [0.1, 0, 0.1, 0];
    const rng = () => rngValues.shift() ?? 0;

    const first = spawnCatalysts(grid, { spawnChance: 0.5, maxCount: 1 }, rng);
    expect(first.spawned).toBe(1);

    const second = spawnCatalysts(first.grid, { spawnChance: 0.5, maxCount: 1 }, rng);
    expect(second.spawned).toBe(0);
  });
});

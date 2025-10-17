import { describe, it, expect } from "vitest";

import type { Grid } from "../../src/engine/grid/grid";
import { createAliveCell, createEmptyCell } from "../../src/engine/grid/cell";
import { executeTurn } from "../../src/engine/turn";

const alive = (energy: number, extra?: Partial<ReturnType<typeof createAliveCell>>) => ({
  ...createAliveCell(energy),
  ...extra
});

const empty = () => createEmptyCell();

describe("executeTurn", () => {
  it("maintains stability, increments streak, and tallies energy", () => {
    const grid: Grid = [[alive(1)]];

    const outcome = executeTurn({
      grid,
      direction: "left",
      lifeOptions: { birthNeighbors: [], survivalNeighbors: [0] },
      dormancyConfig: { threshold: 3 },
      streakState: { streak: 0, multiplier: 1 },
      score: 0
    });

    expect(outcome.stabilityIncremented).toBe(true);
    expect(outcome.streakState).toEqual({ streak: 1, multiplier: 1 });
    expect(outcome.turnScore).toBe(1);
    expect(outcome.score).toBe(1);
    expect(outcome.births).toBe(0);
    expect(outcome.deaths).toBe(0);
    expect(outcome.dormancyConversions).toBe(0);
    expect(outcome.grid[0][0].noMergeTicks).toBe(1);
    expect(grid[0][0].noMergeTicks).toBeUndefined();
  });

  it("resets streak on births and carries multipliers into scoring", () => {
    const grid: Grid = [
      [empty(), alive(1)],
      [empty(), alive(1)],
      [empty(), alive(1)]
    ];

    const outcome = executeTurn({
      grid,
      direction: "left",
      lifeOptions: { birthNeighbors: [3] },
      dormancyConfig: { threshold: 3 },
      streakState: { streak: 2, multiplier: 1.25 },
      score: 10
    });

    expect(outcome.births).toBeGreaterThan(0);
    expect(outcome.deaths).toBeGreaterThan(0);
    expect(outcome.stabilityIncremented).toBe(false);
    expect(outcome.streakState).toEqual({ streak: 0, multiplier: 1 });
    expect(outcome.score).toBe(10 + outcome.turnScore);
  });

  it("applies isolation decay when configured", () => {
    const grid: Grid = [[alive(2)]];

    const outcome = executeTurn({
      grid,
      direction: "left",
      lifeOptions: { birthNeighbors: [3], survivalNeighbors: [0, 1, 2, 3] },
      dormancyConfig: { threshold: 3 },
      decayConfig: { amount: 1 },
      streakState: { streak: 0, multiplier: 1 },
      score: 0
    });

    expect(outcome.decays).toBe(1);
    expect(outcome.grid[0][0].energy).toBe(1);
  });
});

import { describe, it, expect } from "vitest";

import { updateStreak } from "../../src/engine/scoring/streaks";

describe("updateStreak", () => {
  it("increments streak with quarter multipliers up to cap", () => {
    let state = { streak: 0, multiplier: 1 };

    state = updateStreak(state, true);
    expect(state).toEqual({ streak: 1, multiplier: 1 });

    state = updateStreak(state, true);
    expect(state).toEqual({ streak: 2, multiplier: 1.25 });

    state = updateStreak(state, true);
    expect(state).toEqual({ streak: 3, multiplier: 1.5 });

    state = { streak: 10, multiplier: 3 };
    state = updateStreak(state, true);
    expect(state.multiplier).toBe(3);
  });

  it("resets streak on instability", () => {
    const state = updateStreak({ streak: 2, multiplier: 1.25 }, false);
    expect(state).toEqual({ streak: 0, multiplier: 1 });
  });
});

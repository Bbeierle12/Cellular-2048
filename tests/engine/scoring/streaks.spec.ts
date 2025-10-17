import { describe, expect, it } from "vitest";

import { updateStreak } from "../../../src/engine/scoring/streaks";

describe("updateStreak", () => {
  it("resets streak on instability", () => {
    const next = updateStreak({ streak: 4, multiplier: 2 }, false);
    expect(next).toEqual({ streak: 0, multiplier: 1 });
  });

  it("increments streak and scales multiplier", () => {
    const next = updateStreak({ streak: 2, multiplier: 1.5 }, true);
    expect(next.streak).toBe(3);
    expect(next.multiplier).toBeCloseTo(1.5);
  });

  it("caps multiplier at 3x", () => {
    let state = { streak: 10, multiplier: 3 };
    state = updateStreak(state, true);
    expect(state.multiplier).toBe(3);
    expect(state.streak).toBe(11);
  });
});

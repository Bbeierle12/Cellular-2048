import { describe, expect, it } from "vitest";

import { applyScoreEvent, type ScoreEvent } from "../../src/state/reducers";

describe("applyScoreEvent", () => {
  it("updates score using event multiplier", () => {
    const state = { score: 100, multiplier: 2 };
    const event: ScoreEvent = { delta: 10, multiplier: 1.5 };

    const next = applyScoreEvent(state, event);

    expect(next).toEqual({ score: 115, multiplier: 1.5 });
    expect(state).toEqual({ score: 100, multiplier: 2 });
    expect(next).not.toBe(state);
  });
});

import { describe, expect, it } from "vitest";

import { selectMultiplier, selectScore } from "../../src/state/selectors";

const mockState = { score: 42, multiplier: 2.5 };

describe("state selectors", () => {
  it("selects score", () => {
    expect(selectScore(mockState)).toBe(42);
  });

  it("selects multiplier", () => {
    expect(selectMultiplier(mockState)).toBe(2.5);
  });
});

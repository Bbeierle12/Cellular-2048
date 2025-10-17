import { describe, it, expect } from "vitest";

import { createSeededRng } from "../../src/engine/rng/seed";

describe("determinism", () => {
  it("same seed yields same first random", () => {
    const rngA = createSeededRng(123);
    const rngB = createSeededRng(123);
    expect(rngA()).toBeCloseTo(rngB());
  });
});

import { describe, expect, it } from "vitest";

import { createSeededRng } from "../../src/engine/rng/seed";

describe("determinism", () => {
  it("same seed yields same first random", () => {
    const rngA = createSeededRng(123);
    const rngB = createSeededRng(123);
    expect(rngA()).toBeCloseTo(rngB());
  });

  it("produces identical sequences for identical seeds", () => {
    const rngA = createSeededRng(999);
    const rngB = createSeededRng(999);
    for (let i = 0; i < 5; i += 1) {
      expect(rngA()).toBeCloseTo(rngB());
    }
  });

  it("values remain within [0, 1)", () => {
    const rng = createSeededRng(42);
    for (let i = 0; i < 10; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

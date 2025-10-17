import { describe, expect, it } from "vitest";

import { applyCatalyst } from "../../../src/engine/actions/catalyst";

describe("applyCatalyst", () => {
  it("doubles cell energy up to cap", () => {
    const boosted = applyCatalyst({ state: "alive", energy: 3 }, 10);
    expect(boosted.energy).toBe(6);
  });

  it("caps doubled energy", () => {
    const boosted = applyCatalyst({ state: "alive", energy: 6 }, 8);
    expect(boosted.energy).toBe(8);
  });
});

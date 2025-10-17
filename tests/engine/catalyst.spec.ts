import { describe, it, expect } from "vitest";
import { applyCatalyst } from "../../src/engine/actions/catalyst";

describe("applyCatalyst", () => {
  it("caps doubled energy", () => {
    const cell = { state: "alive" as const, energy: 5 };
    const result = applyCatalyst(cell, 8);
    expect(result.energy).toBe(8);
  });
});

import { describe, expect, it } from "vitest";

import { assertNever } from "../../src/utils/validation";

describe("assertNever", () => {
  it("throws with a helpful message", () => {
    expect(() => assertNever("unknown" as never)).toThrow("Unexpected value: unknown");
  });
});

import { describe, expect, it } from "vitest";

import { AnalyticsBuffer } from "../../src/services/analytics";

describe("AnalyticsBuffer", () => {
  it("stores events until flushed", () => {
    const buffer = new AnalyticsBuffer();
    const event = { type: "merge", payload: { energy: 4 } };

    buffer.push(event);
    const flushed = buffer.flush();

    expect(flushed).toEqual([event]);
    expect(buffer.flush()).toEqual([]);
  });

  it("returns a new array on each flush", () => {
    const buffer = new AnalyticsBuffer();
    const event = { type: "score", payload: { delta: 10 } };

    buffer.push(event);
    const first = buffer.flush();
    buffer.push(event);
    const second = buffer.flush();

    expect(first).toEqual([{ type: "score", payload: { delta: 10 } }]);
    expect(second).toEqual([{ type: "score", payload: { delta: 10 } }]);
    expect(first).not.toBe(second);
  });
});

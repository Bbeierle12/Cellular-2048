import { describe, expect, it, vi } from "vitest";

import { TelemetryTracker, type TurnEvent } from "../../../src/engine/telemetry/tracker";

describe("TelemetryTracker", () => {
  it("forwards events to sink", () => {
    const sink = vi.fn();
    const tracker = new TelemetryTracker(sink);
    const event: TurnEvent = {
      births: 1,
      deaths: 2,
      merges: 3,
      averageEnergy: 2.5,
      isolatedCells: 1,
      blightHits: 0,
      catalystUses: 1,
      stabilityStreak: 4
    };

    tracker.emit(event);

    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith(event);
  });
});

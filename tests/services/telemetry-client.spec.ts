import { afterEach, describe, expect, it, vi } from "vitest";

import { createConsoleTelemetryClient } from "../../src/services/telemetry-client";

const event = {
  births: 0,
  deaths: 1,
  merges: 2,
  averageEnergy: 1.5,
  isolatedCells: 0,
  blightHits: 0,
  catalystUses: 1,
  stabilityStreak: 3
};

describe("createConsoleTelemetryClient", () => {
  const originalDebug = console.debug;

  afterEach(() => {
    console.debug = originalDebug;
  });

  it("logs telemetry events to console", async () => {
    const debug = vi.fn();
    console.debug = debug;

    const client = createConsoleTelemetryClient();
    await client.send(event);

    expect(debug).toHaveBeenCalledWith("telemetry", event);
  });
});

import type { TurnEvent } from "../engine/telemetry/tracker";

export interface TelemetryClient {
  send: (event: TurnEvent) => Promise<void>;
}

export function createConsoleTelemetryClient(): TelemetryClient {
  return {
    async send(event) {
      console.debug("telemetry", event);
    }
  };
}

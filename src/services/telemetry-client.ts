import type { TurnEvent } from "../engine/telemetry/tracker";

export interface TelemetryClient {
  send: (event: TurnEvent) => Promise<void>;
  flush?: () => Promise<void>;
}

/**
 * Console-based telemetry client for development
 */
export function createConsoleTelemetryClient(): TelemetryClient {
  return {
    async send(event) {
      console.debug("telemetry", event);
    }
  };
}

/**
 * In-memory buffer telemetry client for testing
 */
export function createBufferedTelemetryClient(): TelemetryClient & { getEvents: () => TurnEvent[] } {
  const events: TurnEvent[] = [];
  
  return {
    async send(event) {
      events.push({ ...event });
    },
    async flush() {
      events.length = 0;
    },
    getEvents() {
      return [...events];
    }
  };
}

/**
 * Session-based telemetry client that groups events by session
 */
export interface TelemetrySession {
  sessionId: string;
  startTime: number;
  events: TurnEvent[];
  metadata: {
    difficulty: string;
    boardSize: number;
    seed: number;
  };
}

export function createSessionTelemetryClient(
  sessionId: string,
  metadata: TelemetrySession["metadata"]
): TelemetryClient & { getSession: () => TelemetrySession } {
  const session: TelemetrySession = {
    sessionId,
    startTime: Date.now(),
    events: [],
    metadata
  };

  return {
    async send(event) {
      session.events.push({ ...event });
    },
    getSession() {
      return session;
    }
  };
}

/**
 * File-based telemetry client (browser-compatible using localStorage)
 */
export function createLocalStorageTelemetryClient(sessionId: string): TelemetryClient {
  const key = `telemetry_session_${sessionId}`;
  
  return {
    async send(event) {
      try {
        const existing = localStorage.getItem(key);
        const events: TurnEvent[] = existing ? JSON.parse(existing) : [];
        events.push(event);
        localStorage.setItem(key, JSON.stringify(events));
      } catch (error) {
        console.error("Failed to save telemetry event:", error);
      }
    },
    async flush() {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Failed to flush telemetry:", error);
      }
    }
  };
}


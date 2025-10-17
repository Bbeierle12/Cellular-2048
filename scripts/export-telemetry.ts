/*
 * Aggregates telemetry session files into summary reports for balancing review.
 * This is a browser-compatible utility that processes localStorage data.
 */

interface TurnEvent {
  births: number;
  deaths: number;
  merges: number;
  averageEnergy: number;
  isolatedCells: number;
  blightHits: number;
  catalystUses: number;
  stabilityStreak: number;
}

interface SessionSummary {
  sessionId: string;
  totalTurns: number;
  totalMerges: number;
  totalBirths: number;
  totalDeaths: number;
  avgEnergy: number;
  maxStreak: number;
  totalBlightHits: number;
  totalCatalystUses: number;
}

/**
 * Exports telemetry data from localStorage to a downloadable format
 * Call this from browser console: exportTelemetry()
 */
export function exportTelemetry(): SessionSummary[] {
  const sessions: SessionSummary[] = [];

  // Scan localStorage for telemetry sessions
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("telemetry_session_")) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const events: TurnEvent[] = JSON.parse(data);
          const summary = summarizeSession(key, events);
          sessions.push(summary);
        } catch (error) {
          console.error(`Failed to parse session ${key}:`, error);
        }
      }
    }
  }

  if (sessions.length === 0) {
    console.log("No telemetry sessions found in localStorage");
    return [];
  }

  console.log(`📊 Processed ${sessions.length} sessions`);
  console.table(sessions);

  // Download as JSON
  downloadJSON(sessions, `telemetry-export-${Date.now()}.json`);

  return sessions;
}

function summarizeSession(sessionId: string, events: TurnEvent[]): SessionSummary {
  let totalMerges = 0;
  let totalBirths = 0;
  let totalDeaths = 0;
  let totalEnergy = 0;
  let maxStreak = 0;
  let totalBlightHits = 0;
  let totalCatalystUses = 0;

  for (const event of events) {
    totalMerges += event.merges;
    totalBirths += event.births;
    totalDeaths += event.deaths;
    totalEnergy += event.averageEnergy;
    totalBlightHits += event.blightHits;
    totalCatalystUses += event.catalystUses;
    if (event.stabilityStreak > maxStreak) {
      maxStreak = event.stabilityStreak;
    }
  }

  return {
    sessionId,
    totalTurns: events.length,
    totalMerges,
    totalBirths,
    totalDeaths,
    avgEnergy: events.length > 0 ? totalEnergy / events.length : 0,
    maxStreak,
    totalBlightHits,
    totalCatalystUses
  };
}

function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`✅ Downloaded: ${filename}`);
}

/**
 * Clears all telemetry sessions from localStorage
 */
export function clearTelemetry(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("telemetry_session_")) {
      keys.push(key);
    }
  }

  keys.forEach((key) => localStorage.removeItem(key));
  console.log(`🗑️ Cleared ${keys.length} telemetry sessions`);
}

// Make functions available globally for console access
if (typeof window !== "undefined") {
  (window as any).exportTelemetry = exportTelemetry;
  (window as any).clearTelemetry = clearTelemetry;
}



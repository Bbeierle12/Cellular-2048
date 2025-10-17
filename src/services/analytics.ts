import type { TurnEvent } from "../engine/telemetry/tracker";

export interface AnalyticsEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

/**
 * Buffer for collecting analytics events before sending
 */
export class AnalyticsBuffer {
  private readonly events: AnalyticsEvent[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  push(event: AnalyticsEvent): void {
    this.events.push({
      ...event,
      timestamp: event.timestamp || Date.now()
    });

    // Auto-flush if buffer is full
    if (this.events.length >= this.maxSize) {
      this.flush();
    }
  }

  flush(): AnalyticsEvent[] {
    const copy = [...this.events];
    this.events.length = 0;
    return copy;
  }

  size(): number {
    return this.events.length;
  }
}

/**
 * Analytics aggregator for turn events
 */
export interface TurnStats {
  totalTurns: number;
  totalMerges: number;
  totalBirths: number;
  totalDeaths: number;
  averageEnergy: number;
  maxStreak: number;
  totalBlightHits: number;
  totalCatalystUses: number;
}

export class TurnAnalytics {
  private stats: TurnStats = {
    totalTurns: 0,
    totalMerges: 0,
    totalBirths: 0,
    totalDeaths: 0,
    averageEnergy: 0,
    maxStreak: 0,
    totalBlightHits: 0,
    totalCatalystUses: 0
  };

  recordTurn(event: TurnEvent): void {
    this.stats.totalTurns++;
    this.stats.totalMerges += event.merges;
    this.stats.totalBirths += event.births;
    this.stats.totalDeaths += event.deaths;
    this.stats.totalBlightHits += event.blightHits;
    this.stats.totalCatalystUses += event.catalystUses;
    
    // Update running average energy
    const oldTotal = this.stats.averageEnergy * (this.stats.totalTurns - 1);
    this.stats.averageEnergy = (oldTotal + event.averageEnergy) / this.stats.totalTurns;
    
    // Track max streak
    if (event.stabilityStreak > this.stats.maxStreak) {
      this.stats.maxStreak = event.stabilityStreak;
    }
  }

  getStats(): Readonly<TurnStats> {
    return { ...this.stats };
  }

  reset(): void {
    this.stats = {
      totalTurns: 0,
      totalMerges: 0,
      totalBirths: 0,
      totalDeaths: 0,
      averageEnergy: 0,
      maxStreak: 0,
      totalBlightHits: 0,
      totalCatalystUses: 0
    };
  }
}


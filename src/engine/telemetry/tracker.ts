export interface TurnEvent {
  births: number;
  deaths: number;
  merges: number;
  averageEnergy: number;
  isolatedCells: number;
  blightHits: number;
  catalystUses: number;
  stabilityStreak: number;
}

export type TelemetrySink = (event: TurnEvent) => void;

export class TelemetryTracker {
  constructor(private readonly sink: TelemetrySink) {}

  emit(event: TurnEvent): void {
    this.sink(event);
  }
}

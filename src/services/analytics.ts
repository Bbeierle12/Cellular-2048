export interface AnalyticsEvent {
  type: string;
  payload: Record<string, unknown>;
}

export class AnalyticsBuffer {
  private readonly events: AnalyticsEvent[] = [];

  push(event: AnalyticsEvent): void {
    this.events.push(event);
  }

  flush(): AnalyticsEvent[] {
    const copy = [...this.events];
    this.events.length = 0;
    return copy;
  }
}

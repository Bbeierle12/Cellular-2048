import type { GameState } from "./index";

export interface ScoreEvent {
  delta: number;
  multiplier: number;
}

export function applyScoreEvent(state: GameState, event: ScoreEvent): GameState {
  return {
    score: state.score + event.delta * event.multiplier,
    multiplier: event.multiplier
  };
}

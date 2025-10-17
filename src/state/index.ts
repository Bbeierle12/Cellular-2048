import { useState } from "react";

export interface GameState {
  score: number;
  multiplier: number;
}

export function useGameState(): [GameState, (next: GameState) => void] {
  return useState<GameState>({ score: 0, multiplier: 1 });
}

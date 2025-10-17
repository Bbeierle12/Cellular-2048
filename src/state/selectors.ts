import type { GameState } from "./index";

export const selectScore = (state: GameState): number => state.score;
export const selectMultiplier = (state: GameState): number => state.multiplier;

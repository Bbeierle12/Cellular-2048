import type { GameState, BoardSnapshot, TurnMetrics } from "./types";
import { serializeBoard } from "./board-serializer";

// Basic state selectors
export const selectScore = (state: GameState): number => state.score;
export const selectMultiplier = (state: GameState): number => state.streakState.multiplier;
export const selectStreak = (state: GameState): number => state.streakState.streak;
export const selectTurnNumber = (state: GameState): number => state.turnNumber;
export const selectTotalEnergy = (state: GameState): number => state.totalEnergy;
export const selectIsGameOver = (state: GameState): boolean => state.isGameOver;
export const selectHasWon = (state: GameState): boolean => state.hasWon;

// Board snapshot for rendering
export const selectBoardSnapshot = (state: GameState): BoardSnapshot => {
  return serializeBoard(state.grid);
};

// Difficulty and config
export const selectDifficulty = (state: GameState) => state.difficulty;
export const selectFeatureFlags = (state: GameState) => state.featureFlags;
export const selectBoardSize = (state: GameState) => state.difficulty.boardSize;
export const selectEnergyCap = (state: GameState) => state.difficulty.eCap;

// Telemetry
export const selectMetrics = (state: GameState): TurnMetrics[] => state.metrics;
export const selectLastTurnMetrics = (state: GameState): TurnMetrics | undefined =>
  state.lastTurnMetrics;

// Aggregate statistics
export const selectAverageEnergy = (state: GameState): number => {
  const snapshot = serializeBoard(state.grid);
  if (snapshot.aliveCells === 0) return 0;
  return state.totalEnergy / snapshot.aliveCells;
};

export const selectBoardOccupancy = (state: GameState): number => {
  const snapshot = serializeBoard(state.grid);
  const totalCells = snapshot.width * snapshot.height;
  const occupiedCells = snapshot.aliveCells + snapshot.dormantCells;
  return occupiedCells / totalCells;
};

// Game progress indicators
export const selectProgressToWin = (state: GameState): number => {
  const threshold = state.difficulty.stabilizeThreshold;
  return Math.min(state.totalEnergy / threshold, 1.0);
};


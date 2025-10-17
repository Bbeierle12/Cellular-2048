import { useReducer, useEffect, useCallback } from "react";
import type { GameState, GameAction, GameConfig } from "./types";
import { gameReducer, createInitialState } from "./reducers";
import { TelemetryTracker, type TurnEvent } from "../engine/telemetry/tracker";
import { defaultFlags } from "../../config/feature-flags";

// Re-export types
export type { GameState, GameAction, GameConfig } from "./types";
export type { BoardSnapshot, SerializedCell, TurnMetrics } from "./types";
export * from "./selectors";

/**
 * Hook that provides game state and dispatch function
 */
export function useGameState(
  initialConfig?: Partial<GameConfig>
): [GameState, React.Dispatch<GameAction>] {
  // Load default difficulty if not provided
  const defaultDifficulty = {
    name: "early",
    boardSize: 6,
    eCap: 8,
    birthRule: "2-3" as const,
    blight: "off" as const,
    decay: "off" as const,
    catalystRate: "low" as const,
    stabilizeThreshold: 25
  };

  const config: GameConfig = {
    difficulty: initialConfig?.difficulty ?? defaultDifficulty,
    featureFlags: initialConfig?.featureFlags ?? defaultFlags,
    seed: initialConfig?.seed,
    boardSize: initialConfig?.boardSize
  };

  const [state, dispatch] = useReducer(gameReducer, config, createInitialState);

  return [state, dispatch];
}

/**
 * Hook that provides game state with telemetry tracking
 */
export function useGameStateWithTelemetry(
  telemetrySink: (event: TurnEvent) => void,
  initialConfig?: Partial<GameConfig>
): [GameState, React.Dispatch<GameAction>] {
  const [state, dispatch] = useGameState(initialConfig);
  const tracker = new TelemetryTracker(telemetrySink);

  // Send telemetry for last turn
  useEffect(() => {
    if (state.lastTurnMetrics) {
      const event: TurnEvent = {
        births: state.lastTurnMetrics.births,
        deaths: state.lastTurnMetrics.deaths,
        merges: state.lastTurnMetrics.merges,
        averageEnergy: state.totalEnergy / Math.max(1, state.lastTurnMetrics.totalEnergy),
        isolatedCells: 0, // TODO: track this
        blightHits: state.lastTurnMetrics.blightConversions,
        catalystUses: state.lastTurnMetrics.catalystUses,
        stabilityStreak: state.streakState.streak
      };
      tracker.emit(event);
    }
  }, [state.lastTurnMetrics, state.totalEnergy, state.streakState.streak, tracker]);

  return [state, dispatch];
}

/**
 * Helper to create swipe action
 */
export function createSwipeAction(direction: "N" | "E" | "S" | "W"): GameAction {
  return { type: "SWIPE", direction };
}

/**
 * Helper to create reset action
 */
export function createResetAction(): GameAction {
  return { type: "RESET" };
}

/**
 * Helper to initialize game with specific config
 */
export function createInitializeAction(config: Partial<GameConfig>): GameAction {
  return { type: "INITIALIZE", config };
}


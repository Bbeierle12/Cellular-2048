import type { Grid } from "../engine/grid/grid";
import type { Cell } from "../engine/grid/cell";
import type { StreakState } from "../engine/scoring/streaks";
import type { Seed } from "../engine/rng/seed";
import type { LifeTickOptions } from "../engine/lifecycle/life-tick";
import type { DormancyConfig } from "../engine/lifecycle/dormancy";
import type { IsolationDecayConfig } from "../engine/lifecycle/decay";
import type { BlightSpawnConfig, CatalystSpawnConfig } from "../engine/hazards/spawn";
import type { FeatureFlags } from "../../config/feature-flags";

/**
 * Difficulty level configuration loaded from JSON
 */
export interface DifficultyConfig {
  name: string;
  boardSize: number;
  eCap: number;
  birthRule: "2-3" | "3";
  blight: "off" | "low" | "medium" | "high";
  decay: "off" | "on";
  catalystRate: "off" | "low" | "medium" | "high";
  stabilizeThreshold: number;
}

/**
 * Turn metrics for telemetry tracking
 */
export interface TurnMetrics {
  turnNumber: number;
  moved: boolean;
  merges: number;
  births: number;
  deaths: number;
  dormancyConversions: number;
  decays: number;
  blightConversions: number;
  blightSpawns: number;
  catalystSpawns: number;
  catalystUses: number;
  turnScore: number;
  totalEnergy: number;
  stabilityIncremented: boolean;
  timestamp: number;
}

/**
 * Serialized cell representation for rendering
 */
export interface SerializedCell {
  x: number;
  y: number;
  kind: "empty" | "alive" | "dormant" | "blight" | "catalyst";
  energy: number;
  mergedThisSwipe?: boolean;
  noMergeTicks?: number;
}

/**
 * Board snapshot for UI consumption
 */
export interface BoardSnapshot {
  width: number;
  height: number;
  cells: SerializedCell[];
  aliveCells: number;
  dormantCells: number;
  blightTokens: number;
  catalystTokens: number;
}

/**
 * Complete game state
 */
export interface GameState {
  // Core board
  grid: Grid;
  
  // Scoring
  score: number;
  streakState: StreakState;
  totalEnergy: number;
  
  // Turn tracking
  turnNumber: number;
  isGameOver: boolean;
  hasWon: boolean;
  
  // Configuration
  difficulty: DifficultyConfig;
  featureFlags: FeatureFlags;
  
  // RNG state (seed for determinism, counter for state tracking)
  seed: Seed;
  rngCallCount: number;
  
  // Telemetry
  metrics: TurnMetrics[];
  
  // Last turn outcome (for UI feedback)
  lastTurnMetrics?: TurnMetrics;
}

/**
 * Actions that can be dispatched to the game reducer
 */
export type GameAction =
  | { type: "SWIPE"; direction: "N" | "E" | "S" | "W" }
  | { type: "RESET" }
  | { type: "INITIALIZE"; config: Partial<GameConfig> }
  | { type: "UPDATE_FLAGS"; flags: Partial<FeatureFlags> };

/**
 * Configuration for initializing a new game
 */
export interface GameConfig {
  difficulty: DifficultyConfig;
  featureFlags: FeatureFlags;
  seed?: number;
  boardSize?: number;
}

/**
 * Engine configuration derived from difficulty and feature flags
 */
export interface EngineConfig {
  lifeOptions: LifeTickOptions;
  dormancyConfig: DormancyConfig;
  decayConfig?: IsolationDecayConfig;
  blightConfig?: BlightSpawnConfig;
  catalystConfig?: CatalystSpawnConfig;
  eCap: number;
}

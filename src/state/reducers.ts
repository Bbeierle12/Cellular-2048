import type { GameState, GameAction, GameConfig, TurnMetrics } from "./types";
import type { Direction } from "../engine/actions/swipe";
import { buildEngineConfig } from "./engine-config";
import { createGrid } from "../engine/grid/grid";
import { createSeededRng } from "../engine/rng/seed";
import { executeTurn } from "../engine/turn";
import { calculateTotalEnergy, isGameOver, checkWinCondition } from "./board-serializer";
import { defaultFlags } from "../../config/feature-flags";

/**
 * Creates the initial game state
 */
export function createInitialState(config: GameConfig): GameState {
  const seed = config.seed ?? Date.now();
  const boardSize = config.boardSize ?? config.difficulty.boardSize;
  const rng = createSeededRng(seed);

  return {
    grid: createGrid({ rows: boardSize, cols: boardSize }, rng),
    score: 0,
    streakState: { streak: 0, multiplier: 1.0 },
    totalEnergy: 0,
    turnNumber: 0,
    isGameOver: false,
    hasWon: false,
    difficulty: config.difficulty,
    featureFlags: config.featureFlags,
    seed,
    rngCallCount: 0,
    metrics: [],
    lastTurnMetrics: undefined
  };
}

/**
 * Main game reducer - pure function that handles all game actions
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INITIALIZE":
      return createInitialState({
        difficulty: action.config.difficulty ?? state.difficulty,
        featureFlags: action.config.featureFlags ?? state.featureFlags,
        seed: action.config.seed,
        boardSize: action.config.boardSize
      });

    case "RESET":
      return createInitialState({
        difficulty: state.difficulty,
        featureFlags: state.featureFlags,
        seed: Date.now()
      });

    case "UPDATE_FLAGS":
      return {
        ...state,
        featureFlags: { ...state.featureFlags, ...action.flags }
      };

    case "SWIPE":
      return executeSwipeTurn(state, action.direction);

    default:
      return state;
  }
}

/**
 * Executes a full turn sequence: swipe → life → dormancy → hazards → scoring
 */
function executeSwipeTurn(
  state: GameState,
  direction: "N" | "E" | "S" | "W"
): GameState {
  // Don't allow moves if game is over
  if (state.isGameOver || state.hasWon) {
    return state;
  }

  // Map compass directions to engine directions
  const directionMap: Record<"N" | "E" | "S" | "W", Direction> = {
    N: "up",
    E: "right",
    S: "down",
    W: "left"
  };
  const engineDirection = directionMap[direction];

  // Build engine configuration from difficulty and flags
  const engineConfig = buildEngineConfig(state.difficulty, state.featureFlags);

  // Create RNG from seed and call count
  // We increment the call count to ensure different RNG state each turn
  const rng = createSeededRng(state.seed + state.rngCallCount);

  // Build hazard configuration
  const hazards =
    engineConfig.blightConfig || engineConfig.catalystConfig
      ? {
          blight: engineConfig.blightConfig,
          catalyst: engineConfig.catalystConfig
        }
      : undefined;

  // Execute the full turn using the engine
  const turnOutcome = executeTurn({
    grid: state.grid,
    direction: engineDirection,
    swipeOptions: {
      eCap: engineConfig.eCap
    },
    lifeOptions: engineConfig.lifeOptions,
    dormancyConfig: engineConfig.dormancyConfig,
    decayConfig: engineConfig.decayConfig,
    streakState: state.streakState,
    score: state.score,
    hazards,
    rng
  });

  // If nothing moved, don't update state
  if (!turnOutcome.moved) {
    return state;
  }

  // Calculate new total energy
  const newTotalEnergy = calculateTotalEnergy(turnOutcome.grid);

  // Create turn metrics for telemetry
  const turnMetrics: TurnMetrics = {
    turnNumber: state.turnNumber + 1,
    moved: turnOutcome.moved,
    merges: turnOutcome.merges,
    births: turnOutcome.births,
    deaths: turnOutcome.deaths,
    dormancyConversions: turnOutcome.dormancyConversions,
    decays: turnOutcome.decays,
    blightConversions: turnOutcome.blightConversions,
    blightSpawns: turnOutcome.blightSpawns,
    catalystSpawns: turnOutcome.catalystSpawns,
    catalystUses: 0, // TODO: track this in engine
    turnScore: turnOutcome.turnScore,
    totalEnergy: newTotalEnergy,
    stabilityIncremented: turnOutcome.stabilityIncremented,
    timestamp: Date.now()
  };

  // Check game state
  const gameOver = isGameOver(turnOutcome.grid);
  const hasWon = checkWinCondition(
    newTotalEnergy,
    turnOutcome.stabilityIncremented,
    state.difficulty.stabilizeThreshold
  );

  return {
    ...state,
    grid: turnOutcome.grid,
    score: turnOutcome.score,
    streakState: turnOutcome.streakState,
    totalEnergy: newTotalEnergy,
    turnNumber: state.turnNumber + 1,
    rngCallCount: state.rngCallCount + 1,
    isGameOver: gameOver,
    hasWon,
    metrics: [...state.metrics, turnMetrics],
    lastTurnMetrics: turnMetrics
  };
}


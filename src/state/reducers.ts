import type { GameState, GameAction, GameConfig, TurnMetrics } from "./types";
import type { Direction } from "../engine/actions/swipe";
import { buildEngineConfig } from "./engine-config";
import { createGrid } from "../engine/grid/grid";
import { createParticleField } from "../engine/particle";
import { createSeededRng } from "../engine/rng/seed";
import { executeTurn } from "../engine/turn";
import { executeParticleTurn } from "../engine/particle-turn";
import { defaultPhysicsConfig } from "../engine/particle/physics";
import { calculateTotalEnergy, isGameOver, checkWinCondition } from "./board-serializer";
import { defaultFlags } from "../../config/feature-flags";

/**
 * Creates the initial game state
 */
export function createInitialState(config: GameConfig): GameState {
  const seed = config.seed ?? Date.now();
  const boardSize = config.boardSize ?? config.difficulty.boardSize;
  const mode = config.mode ?? "particle"; // Default to particle mode
  const rng = createSeededRng(seed);

  const grid = createGrid({ rows: boardSize, cols: boardSize }, rng);
  const rng2 = createSeededRng(seed); // Reset RNG for particles
  const particleField = createParticleField(8, rng2); // Start with 8 particles

  return {
    mode,
    grid,
    particleField,
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
        boardSize: action.config.boardSize,
        mode: action.config.mode ?? state.mode
      });

    case "RESET":
      return createInitialState({
        difficulty: state.difficulty,
        featureFlags: state.featureFlags,
        seed: Date.now(),
        mode: state.mode
      });

    case "UPDATE_FLAGS":
      return {
        ...state,
        featureFlags: { ...state.featureFlags, ...action.flags }
      };

    case "TOGGLE_MODE":
      return createInitialState({
        difficulty: state.difficulty,
        featureFlags: state.featureFlags,
        seed: Date.now(),
        mode: state.mode === "grid" ? "particle" : "grid"
      });

    case "SWIPE":
      return state.mode === "particle"
        ? executeParticleSwipeTurn(state, action.direction)
        : executeSwipeTurn(state, action.direction);

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

/**
 * Execute a swipe turn in particle mode
 */
function executeParticleSwipeTurn(
  state: GameState,
  direction: "N" | "E" | "S" | "W"
): GameState {
  // Don't allow moves if game is over
  if (state.isGameOver || state.hasWon) {
    return state;
  }

  if (!state.particleField) {
    console.error("No particle field in state");
    return state;
  }

  // Map compass directions to engine directions
  const directionMap: Record<"N" | "E" | "S" | "W", "up" | "down" | "left" | "right"> = {
    N: "up",
    E: "right",
    S: "down",
    W: "left"
  };
  const engineDirection = directionMap[direction];

  // Execute particle turn
  const turnOutcome = executeParticleTurn({
    field: state.particleField,
    direction: engineDirection,
    forceStrength: 0.2,
    mergeOptions: {
      eCap: state.difficulty.eCap
    },
    lifeOptions: {
      birthRule: state.difficulty.birthRule,
      neighborRadius: 0.15,
      birthRadius: 0.12,
      maxBirths: 10
    },
    physicsConfig: defaultPhysicsConfig,
    streakState: state.streakState,
    score: state.score,
    maxPhysicsSteps: 60
  });

  if (!turnOutcome.moved) {
    return state;
  }

  // Create turn metrics for telemetry
  const turnMetrics: TurnMetrics = {
    turnNumber: state.turnNumber + 1,
    moved: turnOutcome.moved,
    merges: turnOutcome.merges,
    births: turnOutcome.births,
    deaths: turnOutcome.deaths,
    dormancyConversions: 0, // TODO: implement for particles
    decays: 0, // TODO: implement for particles
    blightConversions: 0,
    blightSpawns: 0,
    catalystSpawns: 0,
    catalystUses: 0,
    turnScore: turnOutcome.turnScore,
    totalEnergy: turnOutcome.totalEnergy,
    stabilityIncremented: turnOutcome.stabilityIncremented,
    timestamp: Date.now()
  };

  // Check game state (simplified for particles)
  const gameOver = turnOutcome.field.filter(p => p.state === "alive").length === 0;
  const hasWon = turnOutcome.totalEnergy >= state.difficulty.stabilizeThreshold;

  return {
    ...state,
    particleField: turnOutcome.field,
    score: turnOutcome.score,
    streakState: turnOutcome.streakState,
    totalEnergy: turnOutcome.totalEnergy,
    turnNumber: state.turnNumber + 1,
    rngCallCount: state.rngCallCount + 1,
    isGameOver: gameOver,
    hasWon,
    metrics: [...state.metrics, turnMetrics],
    lastTurnMetrics: turnMetrics
  };
}


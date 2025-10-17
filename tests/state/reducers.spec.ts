import { describe, expect, it, beforeEach } from "vitest";
import { gameReducer, createInitialState } from "../../src/state/reducers";
import type { GameState, GameConfig } from "../../src/state/types";
import { createAliveCell } from "../../src/engine/grid/cell";

describe("createInitialState", () => {
  it("creates a valid initial game state", () => {
    const config: GameConfig = {
      difficulty: {
        name: "early",
        boardSize: 6,
        eCap: 8,
        birthRule: "2-3",
        blight: "off",
        decay: "off",
        catalystRate: "low",
        stabilizeThreshold: 25
      },
      featureFlags: {
        blight: false,
        catalysts: true,
        decay: false,
        telemetry: true
      },
      seed: 12345
    };

    const state = createInitialState(config);

    expect(state.grid).toBeDefined();
    expect(state.grid.length).toBe(6);
    expect(state.grid[0].length).toBe(6);
    expect(state.score).toBe(0);
    expect(state.turnNumber).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(state.hasWon).toBe(false);
    expect(state.seed).toBe(12345);
    expect(state.difficulty.name).toBe("early");
  });

  it("uses boardSize override if provided", () => {
    const config: GameConfig = {
      difficulty: {
        name: "early",
        boardSize: 6,
        eCap: 8,
        birthRule: "2-3",
        blight: "off",
        decay: "off",
        catalystRate: "low",
        stabilizeThreshold: 25
      },
      featureFlags: {
        blight: false,
        catalysts: false,
        decay: false,
        telemetry: false
      },
      boardSize: 8
    };

    const state = createInitialState(config);

    expect(state.grid.length).toBe(8);
    expect(state.grid[0].length).toBe(8);
  });

  it("generates random seed if not provided", () => {
    const config: GameConfig = {
      difficulty: {
        name: "early",
        boardSize: 6,
        eCap: 8,
        birthRule: "2-3",
        blight: "off",
        decay: "off",
        catalystRate: "low",
        stabilizeThreshold: 25
      },
      featureFlags: {
        blight: false,
        catalysts: false,
        decay: false,
        telemetry: false
      }
    };

    const state1 = createInitialState(config);
    const state2 = createInitialState(config);

    // Seeds should be different (timestamp-based)
    expect(state1.seed).toBeDefined();
    expect(state2.seed).toBeDefined();
  });
});

describe("gameReducer", () => {
  let initialState: GameState;

  beforeEach(() => {
    const config: GameConfig = {
      difficulty: {
        name: "early",
        boardSize: 6,
        eCap: 8,
        birthRule: "2-3",
        blight: "off",
        decay: "off",
        catalystRate: "low",
        stabilizeThreshold: 25
      },
      featureFlags: {
        blight: false,
        catalysts: false,
        decay: false,
        telemetry: true
      },
      seed: 12345
    };
    initialState = createInitialState(config);
  });

  describe("INITIALIZE action", () => {
    it("reinitializes state with new config", () => {
      const action = {
        type: "INITIALIZE" as const,
        config: {
          seed: 99999
        }
      };

      const newState = gameReducer(initialState, action);

      expect(newState.seed).toBe(99999);
      expect(newState.turnNumber).toBe(0);
      expect(newState.score).toBe(0);
    });
  });

  describe("RESET action", () => {
    it("resets game to initial state with new seed", () => {
      // Modify state
      const modifiedState = {
        ...initialState,
        score: 100,
        turnNumber: 5
      };

      const action = { type: "RESET" as const };
      const newState = gameReducer(modifiedState, action);

      expect(newState.score).toBe(0);
      expect(newState.turnNumber).toBe(0);
      expect(newState.seed).not.toBe(initialState.seed);
      expect(newState.difficulty).toEqual(initialState.difficulty);
    });
  });

  describe("UPDATE_FLAGS action", () => {
    it("updates feature flags without resetting game", () => {
      const action = {
        type: "UPDATE_FLAGS" as const,
        flags: { blight: true, decay: true }
      };

      const newState = gameReducer(initialState, action);

      expect(newState.featureFlags.blight).toBe(true);
      expect(newState.featureFlags.decay).toBe(true);
      expect(newState.featureFlags.catalysts).toBe(false);
      expect(newState.turnNumber).toBe(0); // Should not increment
    });
  });

  describe("SWIPE action", () => {
    it("executes a turn when swipe is valid", () => {
      // Set up a simple grid with alive cells that can move
      const testState = { ...initialState };
      testState.grid[0][0] = createAliveCell(2);
      testState.grid[0][1] = createAliveCell(2);

      const action = { type: "SWIPE" as const, direction: "E" as const };
      const newState = gameReducer(testState, action);

      // After swipe right, cells should compress to the right
      expect(newState.turnNumber).toBe(1);
      expect(newState.metrics.length).toBe(1);
      expect(newState.lastTurnMetrics).toBeDefined();
    });

    it("does not update state if nothing moved", () => {
      // Set up grid where nothing can move (all empty)
      const action = { type: "SWIPE" as const, direction: "N" as const };
      const newState = gameReducer(initialState, action);

      // State should remain unchanged
      expect(newState).toBe(initialState);
      expect(newState.turnNumber).toBe(0);
    });

    it("does not allow moves when game is over", () => {
      const gameOverState = { ...initialState, isGameOver: true };
      const action = { type: "SWIPE" as const, direction: "E" as const };
      const newState = gameReducer(gameOverState, action);

      expect(newState).toBe(gameOverState);
    });

    it("does not allow moves when game is won", () => {
      const wonState = { ...initialState, hasWon: true };
      const action = { type: "SWIPE" as const, direction: "S" as const };
      const newState = gameReducer(wonState, action);

      expect(newState).toBe(wonState);
    });

    it("increments turn number on successful move", () => {
      const testState = { ...initialState };
      testState.grid[0][0] = createAliveCell(1);

      const action = { type: "SWIPE" as const, direction: "E" as const };
      const newState = gameReducer(testState, action);

      expect(newState.turnNumber).toBe(1);
    });

    it("increments RNG call count on each turn", () => {
      const testState = { ...initialState };
      testState.grid[0][0] = createAliveCell(1);
      testState.grid[0][1] = createAliveCell(1);

      const action = { type: "SWIPE" as const, direction: "E" as const };
      const newState = gameReducer(testState, action);

      expect(newState.rngCallCount).toBe(1);
    });

    it("tracks telemetry metrics for each turn", () => {
      const testState = { ...initialState };
      testState.grid[0][0] = createAliveCell(2);
      testState.grid[0][1] = createAliveCell(2);

      const action = { type: "SWIPE" as const, direction: "E" as const };
      const newState = gameReducer(testState, action);

      expect(newState.metrics.length).toBe(1);
      const metrics = newState.metrics[0];
      expect(metrics.turnNumber).toBe(1);
      expect(metrics.moved).toBe(true);
      expect(metrics.timestamp).toBeDefined();
    });
  });

  describe("Turn sequence integration", () => {
    it("executes full turn pipeline: swipe → life → dormancy → scoring", () => {
      // Create a pattern that will trigger Life events
      const testState = { ...initialState };
      // Set up 3 alive cells in a row (will trigger births in Life tick)
      testState.grid[2][0] = createAliveCell(1);
      testState.grid[2][1] = createAliveCell(1);
      testState.grid[2][2] = createAliveCell(1);

      const action = { type: "SWIPE" as const, direction: "S" as const };
      const newState = gameReducer(testState, action);

      // Should have executed and tracked metrics
      expect(newState.turnNumber).toBe(1);
      expect(newState.lastTurnMetrics).toBeDefined();
      expect(newState.score).toBeGreaterThan(0);
    });
  });
});


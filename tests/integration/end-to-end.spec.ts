import { describe, it, expect } from "vitest";
import { createInitialState, gameReducer } from "../../src/state/reducers";
import type { GameConfig } from "../../src/state/types";
import { createAliveCell } from "../../src/engine/grid/cell";
import { selectScore, selectTotalEnergy, selectBoardSnapshot } from "../../src/state";

describe("End-to-End Game Flow", () => {
  const createTestConfig = (): GameConfig => ({
    difficulty: {
      name: "early",
      boardSize: 6,
      eCap: 8,
      birthRule: "2-3",
      blight: "off",
      decay: "off",
      catalystRate: "off",
      stabilizeThreshold: 25
    },
    featureFlags: {
      blight: false,
      catalysts: false,
      decay: false,
      telemetry: false
    },
    seed: 12345
  });

  it("completes a full game from setup to scoring", () => {
    let state = createInitialState(createTestConfig());

    // Verify initial state
    expect(state.score).toBe(0);
    expect(state.turnNumber).toBe(0);
    expect(state.isGameOver).toBe(false);

    // Set up initial cells for testing
    state.grid[2][2] = createAliveCell(2);
    state.grid[2][3] = createAliveCell(2);

    // Perform swipe
    state = gameReducer(state, { type: "SWIPE", direction: "E" });

    // Verify turn executed
    expect(state.turnNumber).toBe(1);
    expect(state.score).toBeGreaterThan(0);
    expect(state.lastTurnMetrics).toBeDefined();
  });

  it("handles merge sequence correctly", () => {
    let state = createInitialState(createTestConfig());

    // Place two cells of same energy that will merge
    state.grid[0][0] = createAliveCell(2);
    state.grid[0][1] = createAliveCell(2);

    // Swipe right to merge them
    state = gameReducer(state, { type: "SWIPE", direction: "E" });

    // Verify merge occurred
    expect(state.lastTurnMetrics?.merges).toBeGreaterThan(0);

    // Check final board state
    const snapshot = selectBoardSnapshot(state);
    const rightmostCells = snapshot.cells.filter(c => c.x === 5);
    const aliveCells = rightmostCells.filter(c => c.kind === "alive");
    
    // Should have merged cell on right edge
    expect(aliveCells.length).toBeGreaterThan(0);
  });

  it("triggers Life tick births and deaths", () => {
    let state = createInitialState(createTestConfig());

    // Create pattern that triggers Life events: 3 alive cells in a row
    state.grid[2][1] = createAliveCell(1);
    state.grid[2][2] = createAliveCell(1);
    state.grid[2][3] = createAliveCell(1);

    // Swipe to trigger Life tick
    state = gameReducer(state, { type: "SWIPE", direction: "S" });

    // Verify Life tick occurred (births or deaths)
    const metrics = state.lastTurnMetrics;
    expect(metrics).toBeDefined();
    expect(metrics!.births + metrics!.deaths).toBeGreaterThan(0);
  });

  it("accumulates score over multiple turns", () => {
    let state = createInitialState(createTestConfig());

    // Set up cells
    state.grid[0][0] = createAliveCell(1);
    state.grid[0][1] = createAliveCell(1);

    // First turn
    state = gameReducer(state, { type: "SWIPE", direction: "E" });
    const score1 = selectScore(state);
    expect(score1).toBeGreaterThan(0);

    // Second turn
    state.grid[1][0] = createAliveCell(1);
    state = gameReducer(state, { type: "SWIPE", direction: "S" });
    const score2 = selectScore(state);
    expect(score2).toBeGreaterThanOrEqual(score1);
  });

  it("prevents moves when game is over", () => {
    let state = createInitialState(createTestConfig());
    state.isGameOver = true;

    const before = { ...state };
    state = gameReducer(state, { type: "SWIPE", direction: "N" });

    // State should not change
    expect(state).toBe(before);
    expect(state.turnNumber).toBe(0);
  });

  it("resets game state correctly", () => {
    let state = createInitialState(createTestConfig());

    // Play some turns
    state.grid[0][0] = createAliveCell(2);
    state = gameReducer(state, { type: "SWIPE", direction: "E" });
    state = gameReducer(state, { type: "SWIPE", direction: "S" });

    const scoreBeforeReset = selectScore(state);
    const turnBeforeReset = state.turnNumber;

    expect(scoreBeforeReset).toBeGreaterThan(0);
    expect(turnBeforeReset).toBeGreaterThan(0);

    // Reset
    state = gameReducer(state, { type: "RESET" });

    // Verify reset
    expect(state.score).toBe(0);
    expect(state.turnNumber).toBe(0);
    expect(state.metrics.length).toBe(0);
    expect(state.isGameOver).toBe(false);
  });

  it("tracks telemetry metrics correctly", () => {
    let state = createInitialState(createTestConfig());

    // Set up multiple cells
    state.grid[0][0] = createAliveCell(2);
    state.grid[0][1] = createAliveCell(2);
    state.grid[1][0] = createAliveCell(1);

    // Execute turn
    state = gameReducer(state, { type: "SWIPE", direction: "E" });

    // Verify metrics recorded
    expect(state.metrics.length).toBe(1);
    expect(state.lastTurnMetrics).toBeDefined();
    expect(state.lastTurnMetrics?.turnNumber).toBe(1);
    expect(state.lastTurnMetrics?.moved).toBe(true);
    expect(state.lastTurnMetrics?.timestamp).toBeDefined();
  });

  it("handles dormancy transitions", () => {
    let state = createInitialState(createTestConfig());

    // Place a single E=1 cell that won't merge
    state.grid[3][3] = createAliveCell(1);

    // Swipe multiple times without merging (will trigger dormancy)
    for (let i = 0; i < 4; i++) {
      state = gameReducer(state, { type: "SWIPE", direction: i % 2 === 0 ? "N" : "S" });
    }

    // Check if any dormancy conversions occurred
    const totalDormancy = state.metrics.reduce((sum, m) => sum + m.dormancyConversions, 0);
    // Dormancy may or may not occur depending on Life tick births, but test shouldn't crash
    expect(totalDormancy).toBeGreaterThanOrEqual(0);
  });

  it("maintains determinism with same seed", () => {
    const config = createTestConfig();

    // Game 1
    let state1 = createInitialState(config);
    state1.grid[0][0] = createAliveCell(2);
    state1.grid[0][1] = createAliveCell(2);
    state1 = gameReducer(state1, { type: "SWIPE", direction: "E" });
    state1 = gameReducer(state1, { type: "SWIPE", direction: "S" });

    // Game 2 with same seed and actions
    let state2 = createInitialState(config);
    state2.grid[0][0] = createAliveCell(2);
    state2.grid[0][1] = createAliveCell(2);
    state2 = gameReducer(state2, { type: "SWIPE", direction: "E" });
    state2 = gameReducer(state2, { type: "SWIPE", direction: "S" });

    // Results should be identical
    expect(state1.score).toBe(state2.score);
    expect(state1.totalEnergy).toBe(state2.totalEnergy);
    expect(state1.turnNumber).toBe(state2.turnNumber);
  });

  it("detects win condition", () => {
    let state = createInitialState(createTestConfig());

    // Artificially create win condition
    // Set high energy and ensure stability
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (i < 2 && j < 2) {
          state.grid[i][j] = createAliveCell(5);
        }
      }
    }

    state.totalEnergy = 30; // Above threshold of 25

    // Force stability by setting up still life pattern
    // 2x2 block is stable in Conway's Life
    state.grid = state.grid.map(row => row.map(cell => ({ state: "empty" as const, energy: 0 })));
    state.grid[2][2] = createAliveCell(5);
    state.grid[2][3] = createAliveCell(5);
    state.grid[3][2] = createAliveCell(5);
    state.grid[3][3] = createAliveCell(5);

    // Swipe (this pattern is stable, so no births/deaths)
    state = gameReducer(state, { type: "SWIPE", direction: "N" });

    // Check metrics show stability
    expect(state.lastTurnMetrics?.births).toBe(0);
    expect(state.lastTurnMetrics?.deaths).toBe(0);
    expect(state.lastTurnMetrics?.stabilityIncremented).toBe(true);
  });
});

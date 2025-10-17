import { describe, expect, it, beforeEach } from "vitest";
import {
  selectScore,
  selectMultiplier,
  selectStreak,
  selectTurnNumber,
  selectTotalEnergy,
  selectIsGameOver,
  selectHasWon,
  selectBoardSnapshot,
  selectDifficulty,
  selectFeatureFlags,
  selectBoardSize,
  selectEnergyCap,
  selectMetrics,
  selectLastTurnMetrics,
  selectAverageEnergy,
  selectBoardOccupancy,
  selectProgressToWin
} from "../../src/state/selectors";
import { createInitialState } from "../../src/state/reducers";
import type { GameState, GameConfig } from "../../src/state/types";
import { createAliveCell, createDormantCell } from "../../src/engine/grid/cell";

describe("state selectors", () => {
  let mockState: GameState;

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
        catalysts: true,
        decay: false,
        telemetry: true
      },
      seed: 12345
    };
    mockState = createInitialState(config);
  });

  describe("Basic selectors", () => {
    it("selects score", () => {
      mockState.score = 100;
      expect(selectScore(mockState)).toBe(100);
    });

    it("selects multiplier", () => {
      mockState.streakState.multiplier = 2.5;
      expect(selectMultiplier(mockState)).toBe(2.5);
    });

    it("selects streak", () => {
      mockState.streakState.streak = 5;
      expect(selectStreak(mockState)).toBe(5);
    });

    it("selects turn number", () => {
      mockState.turnNumber = 10;
      expect(selectTurnNumber(mockState)).toBe(10);
    });

    it("selects total energy", () => {
      mockState.totalEnergy = 42;
      expect(selectTotalEnergy(mockState)).toBe(42);
    });

    it("selects game over state", () => {
      mockState.isGameOver = true;
      expect(selectIsGameOver(mockState)).toBe(true);
    });

    it("selects win state", () => {
      mockState.hasWon = true;
      expect(selectHasWon(mockState)).toBe(true);
    });
  });

  describe("Board snapshot selector", () => {
    it("returns board snapshot with correct dimensions", () => {
      const snapshot = selectBoardSnapshot(mockState);
      
      expect(snapshot.width).toBe(6);
      expect(snapshot.height).toBe(6);
      expect(snapshot.cells.length).toBe(36);
    });

    it("counts alive cells correctly", () => {
      mockState.grid[0][0] = createAliveCell(2);
      mockState.grid[1][1] = createAliveCell(3);
      mockState.grid[2][2] = createAliveCell(1);

      const snapshot = selectBoardSnapshot(mockState);
      
      expect(snapshot.aliveCells).toBe(3);
    });

    it("counts dormant cells correctly", () => {
      mockState.grid[0][0] = createDormantCell(1);
      mockState.grid[1][1] = createDormantCell(2);

      const snapshot = selectBoardSnapshot(mockState);
      
      expect(snapshot.dormantCells).toBe(2);
    });

    it("serializes cell positions correctly", () => {
      mockState.grid[2][3] = createAliveCell(5);

      const snapshot = selectBoardSnapshot(mockState);
      const cell = snapshot.cells.find(c => c.x === 3 && c.y === 2);
      
      expect(cell).toBeDefined();
      expect(cell!.kind).toBe("alive");
      expect(cell!.energy).toBe(5);
    });
  });

  describe("Configuration selectors", () => {
    it("selects difficulty", () => {
      const difficulty = selectDifficulty(mockState);
      expect(difficulty.name).toBe("early");
      expect(difficulty.boardSize).toBe(6);
    });

    it("selects feature flags", () => {
      const flags = selectFeatureFlags(mockState);
      expect(flags.catalysts).toBe(true);
      expect(flags.blight).toBe(false);
    });

    it("selects board size", () => {
      expect(selectBoardSize(mockState)).toBe(6);
    });

    it("selects energy cap", () => {
      expect(selectEnergyCap(mockState)).toBe(8);
    });
  });

  describe("Telemetry selectors", () => {
    it("selects metrics array", () => {
      const metrics = selectMetrics(mockState);
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBe(0);
    });

    it("selects last turn metrics", () => {
      expect(selectLastTurnMetrics(mockState)).toBeUndefined();

      mockState.lastTurnMetrics = {
        turnNumber: 1,
        moved: true,
        merges: 2,
        births: 1,
        deaths: 0,
        dormancyConversions: 0,
        decays: 0,
        blightConversions: 0,
        blightSpawns: 0,
        catalystSpawns: 0,
        catalystUses: 0,
        turnScore: 10,
        totalEnergy: 15,
        stabilityIncremented: false,
        timestamp: Date.now()
      };

      const lastMetrics = selectLastTurnMetrics(mockState);
      expect(lastMetrics).toBeDefined();
      expect(lastMetrics!.turnNumber).toBe(1);
    });
  });

  describe("Aggregate statistics selectors", () => {
    it("calculates average energy", () => {
      mockState.grid[0][0] = createAliveCell(2);
      mockState.grid[1][1] = createAliveCell(4);
      mockState.grid[2][2] = createAliveCell(6);
      mockState.totalEnergy = 12;

      const avg = selectAverageEnergy(mockState);
      expect(avg).toBe(4);
    });

    it("returns 0 average energy when no alive cells", () => {
      mockState.totalEnergy = 0;
      expect(selectAverageEnergy(mockState)).toBe(0);
    });

    it("calculates board occupancy", () => {
      mockState.grid[0][0] = createAliveCell(1);
      mockState.grid[0][1] = createAliveCell(1);
      mockState.grid[1][0] = createDormantCell(1);

      const occupancy = selectBoardOccupancy(mockState);
      expect(occupancy).toBeCloseTo(3 / 36, 4);
    });

    it("calculates progress to win", () => {
      mockState.totalEnergy = 12;
      mockState.difficulty.stabilizeThreshold = 24;

      const progress = selectProgressToWin(mockState);
      expect(progress).toBe(0.5);
    });

    it("caps progress to win at 1.0", () => {
      mockState.totalEnergy = 30;
      mockState.difficulty.stabilizeThreshold = 25;

      const progress = selectProgressToWin(mockState);
      expect(progress).toBe(1.0);
    });
  });
});


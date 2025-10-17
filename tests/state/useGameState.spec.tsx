import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useGameState, createSwipeAction } from "../../src/state";

describe("useGameState", () => {
  it("initialises with default game state", () => {
    const { result } = renderHook(() => useGameState());

    const state = result.current[0];
    expect(state.score).toBe(0);
    expect(state.turnNumber).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(state.hasWon).toBe(false);
    expect(state.difficulty).toBeDefined();
    expect(state.grid).toBeDefined();
  });

  it("dispatches swipe actions", () => {
    const { result } = renderHook(() => useGameState());

    const initialTurnNumber = result.current[0].turnNumber;

    act(() => {
      result.current[1](createSwipeAction("E"));
    });

    // Turn number should stay same (no valid move on empty board)
    expect(result.current[0].turnNumber).toBe(initialTurnNumber);
  });

  it("dispatches reset action", () => {
    const { result } = renderHook(() => useGameState());

    const initialSeed = result.current[0].seed;

    act(() => {
      result.current[1]({ type: "RESET" });
    });

    // Seed should change on reset
    expect(result.current[0].seed).not.toBe(initialSeed);
    expect(result.current[0].score).toBe(0);
    expect(result.current[0].turnNumber).toBe(0);
  });
});


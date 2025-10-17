import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useGameState } from "../../src/state";

describe("useGameState", () => {
  it("initialises with default game state and updates through setter", () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current[0]).toEqual({ score: 0, multiplier: 1 });

    act(() => {
      result.current[1]({ score: 50, multiplier: 1.5 });
    });

    expect(result.current[0]).toEqual({ score: 50, multiplier: 1.5 });
  });
});

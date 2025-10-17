import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createEmptyCell } from "../../../src/engine/grid/cell";
import type { Grid } from "../../../src/engine/grid/grid";
import { useEngineState } from "../../../src/ui/hooks/useEngineState";

describe("useEngineState", () => {
  it("stores grid state and updates via setter", () => {
    const initial: Grid = [[createEmptyCell()]];
    const { result } = renderHook(() => useEngineState(initial));

    expect(result.current[0]).toBe(initial);

    const next: Grid = [[{ state: "alive", energy: 2 }]];
    act(() => {
      result.current[1](next);
    });

    expect(result.current[0]).toBe(next);
  });
});

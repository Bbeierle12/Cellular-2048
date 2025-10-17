import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSwipe } from "../../../src/ui/hooks/useSwipe";

describe("useSwipe", () => {
  it("returns a stable handler that delegates to callback", () => {
    const handler = vi.fn();
    const { result } = renderHook(({ fn }) => useSwipe(fn), {
      initialProps: { fn: handler }
    });

    result.current("left");
    expect(handler).toHaveBeenCalledWith("left");
  });

  it("updates handler reference when dependencies change", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ fn }) => useSwipe(fn), {
      initialProps: { fn: first }
    });

    rerender({ fn: second });
    result.current("up");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("up");
  });
});

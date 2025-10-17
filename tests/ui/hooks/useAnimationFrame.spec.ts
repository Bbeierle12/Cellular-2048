import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAnimationFrame } from "../../../src/ui/hooks/useAnimationFrame";

type RafCallback = (time: number) => void;

describe("useAnimationFrame", () => {
  const originalRequest = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  const callbacks: Array<(time: number) => void> = [];
  const cancelMock = vi.fn();

  beforeEach(() => {
    callbacks.length = 0;
    cancelMock.mockClear();
    (globalThis as unknown as { requestAnimationFrame: (cb: RafCallback) => number }).requestAnimationFrame =
      ((callback: RafCallback) => {
        callbacks.push((time: number) => callback(time));
        return 1;
      }) as (cb: RafCallback) => number;
    (globalThis as unknown as { cancelAnimationFrame: (handle: number) => void }).cancelAnimationFrame =
      cancelMock as unknown as (handle: number) => void;
  });

  afterEach(() => {
    (globalThis as unknown as { requestAnimationFrame?: typeof originalRequest }).requestAnimationFrame =
      originalRequest;
    (globalThis as unknown as { cancelAnimationFrame?: typeof originalCancel }).cancelAnimationFrame =
      originalCancel;
  });

  it("invokes callback on each animation frame", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAnimationFrame(callback));

    expect(callbacks).toHaveLength(1);

    act(() => {
      callbacks[0](16);
    });

    expect(callback).toHaveBeenCalledWith(16);

    unmount();
    expect(cancelMock).toHaveBeenCalledWith(1);
  });
});

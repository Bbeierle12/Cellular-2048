import { useCallback } from "react";

export type SwipeHandler = (direction: "up" | "down" | "left" | "right") => void;

export function useSwipe(handler: SwipeHandler): SwipeHandler {
  return useCallback((direction) => {
    handler(direction);
  }, [handler]);
}

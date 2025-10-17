import { useEffect, useRef } from "react";

export function useAnimationFrame(callback: (time: number) => void): void {
  const frameRef = useRef<number>();

  useEffect(() => {
    const loop = (time: number) => {
      callback(time);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [callback]);
}

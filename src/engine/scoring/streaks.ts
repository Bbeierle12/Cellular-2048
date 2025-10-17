export interface StreakState {
  streak: number;
  multiplier: number;
}

export function updateStreak(state: StreakState, stabilityIncremented: boolean): StreakState {
  if (!stabilityIncremented) {
    return { streak: 0, multiplier: 1 };
  }

  const nextStreak = state.streak + 1;
  const multiplier = Math.min(1 + 0.25 * (nextStreak - 1), 3);
  return { streak: nextStreak, multiplier };
}

export interface StreakState {
  streak: number;
  multiplier: number;
}

export function updateStreak(state: StreakState, stabilityIncremented: boolean): StreakState {
  if (!stabilityIncremented) {
    return { streak: 0, multiplier: 1 };
  }

  const nextStreak = state.streak + 1;
  const multiplier = Math.min(1 + Math.floor(nextStreak / 3), 5);
  return { streak: nextStreak, multiplier };
}

import type { Direction, SwipeOptions } from "./actions/swipe";
import { applySwipe } from "./actions/swipe";
import type { Grid } from "./grid/grid";
import type { LifeTickOptions } from "./lifecycle/life-tick";
import { lifeTick } from "./lifecycle/life-tick";
import type { DormancyConfig } from "./lifecycle/dormancy";
import { updateDormancy } from "./lifecycle/dormancy";
import type { IsolationDecayConfig } from "./lifecycle/decay";
import { applyIsolationDecay } from "./lifecycle/decay";
import type { StreakState } from "./scoring/streaks";
import { updateStreak } from "./scoring/streaks";
import { tallyScore } from "./scoring";

export interface TurnContext {
  grid: Grid;
  direction: Direction;
  swipeOptions?: SwipeOptions;
  lifeOptions: LifeTickOptions;
  dormancyConfig: DormancyConfig;
  decayConfig?: IsolationDecayConfig;
  streakState: StreakState;
  score: number;
}

export interface TurnOutcome {
  grid: Grid;
  score: number;
  streakState: StreakState;
  turnScore: number;
  totalEnergy: number;
  moved: boolean;
  merges: number;
  births: number;
  deaths: number;
  dormancyConversions: number;
  decays: number;
  stabilityIncremented: boolean;
}

export function executeTurn(context: TurnContext): TurnOutcome {
  const swipeResult = applySwipe(context.grid, context.direction, context.swipeOptions);

  const lifeResult = lifeTick(swipeResult.grid, context.lifeOptions);

  const dormancyResult = updateDormancy(lifeResult.grid, context.dormancyConfig, {
    bornPositions: lifeResult.bornPositions
  });

  const decayResult = context.decayConfig
    ? applyIsolationDecay(dormancyResult.grid, context.decayConfig)
    : { grid: dormancyResult.grid, decayed: 0 };

  const hadBirthOrDeath = lifeResult.births > 0 || lifeResult.deaths > 0;
  const scoreResult = tallyScore(decayResult.grid, hadBirthOrDeath);
  const nextStreak = updateStreak(context.streakState, scoreResult.stabilityIncremented);
  const turnScore = scoreResult.totalEnergy * nextStreak.multiplier;
  const nextScore = context.score + turnScore;

  return {
    grid: decayResult.grid,
    score: nextScore,
    streakState: nextStreak,
    turnScore,
    totalEnergy: scoreResult.totalEnergy,
    moved: swipeResult.moved,
    merges: swipeResult.merges,
    births: lifeResult.births,
    deaths: lifeResult.deaths,
    dormancyConversions: dormancyResult.converted,
    decays: decayResult.decayed,
    stabilityIncremented: scoreResult.stabilityIncremented
  };
}

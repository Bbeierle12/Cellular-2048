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
import type { BlightSpawnConfig, CatalystSpawnConfig, Rng } from "./hazards/spawn";
import { spawnBlightTokens, spawnCatalysts } from "./hazards/spawn";
import { applyBlight } from "./lifecycle/blight";

export interface TurnContext {
  grid: Grid;
  direction: Direction;
  swipeOptions?: SwipeOptions;
  lifeOptions: LifeTickOptions;
  dormancyConfig: DormancyConfig;
  decayConfig?: IsolationDecayConfig;
  streakState: StreakState;
  score: number;
  hazards?: TurnHazardConfig;
  rng?: Rng;
}

export interface TurnHazardConfig {
  blight?: BlightSpawnConfig;
  catalyst?: CatalystSpawnConfig;
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
  blightConversions: number;
  blightSpawns: number;
  catalystSpawns: number;
  stabilityIncremented: boolean;
}

export function executeTurn(context: TurnContext): TurnOutcome {
  let workingGrid = context.grid;
  let blightSpawns = 0;
  let catalystSpawns = 0;

  if (context.hazards) {
    if (!context.rng) {
      throw new Error("Hazard spawning requires an RNG");
    }
    const rng = context.rng;
    if (context.hazards.catalyst) {
      const result = spawnCatalysts(workingGrid, context.hazards.catalyst, rng);
      workingGrid = result.grid;
      catalystSpawns = result.spawned;
    }
    if (context.hazards.blight) {
      const result = spawnBlightTokens(workingGrid, context.hazards.blight, rng);
      workingGrid = result.grid;
      blightSpawns = result.spawned;
    }
  }

  const swipeResult = applySwipe(workingGrid, context.direction, context.swipeOptions);

  const lifeResult = lifeTick(swipeResult.grid, context.lifeOptions);

  const dormancyResult = updateDormancy(lifeResult.grid, context.dormancyConfig, {
    bornPositions: lifeResult.bornPositions
  });

  const blightResult = applyBlight(dormancyResult.grid, {
    lifeOptions: context.lifeOptions
  });

  const decayResult = context.decayConfig
    ? applyIsolationDecay(blightResult.grid, context.decayConfig)
    : { grid: blightResult.grid, decayed: 0 };

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
    blightConversions: blightResult.conversions,
    blightSpawns,
    catalystSpawns,
    stabilityIncremented: scoreResult.stabilityIncremented
  };
}

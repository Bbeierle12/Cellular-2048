import type { ParticleField } from "./particle";
import {
  applyForce,
  updatePhysics,
  hasMovement,
  defaultPhysicsConfig,
  type PhysicsConfig
} from "./particle/physics";
import { detectAndMergeCollisions, type MergeOptions } from "./particle/collisions";
import { particleLifeTick, type ParticleLifeOptions } from "./particle/life";
import type { StreakState } from "./scoring/streaks";
import { updateStreak } from "./scoring/streaks";

export interface ParticleTurnContext {
  field: ParticleField;
  direction: "up" | "down" | "left" | "right";
  forceStrength: number;
  mergeOptions: MergeOptions;
  lifeOptions: ParticleLifeOptions;
  physicsConfig: PhysicsConfig;
  streakState: StreakState;
  score: number;
  maxPhysicsSteps: number; // Maximum physics updates before settling
}

export interface ParticleTurnOutcome {
  field: ParticleField;
  score: number;
  streakState: StreakState;
  turnScore: number;
  totalEnergy: number;
  moved: boolean;
  merges: number;
  births: number;
  deaths: number;
  stabilityIncremented: boolean;
  physicsSteps: number;
}

/**
 * Execute a complete turn in particle mode:
 * 1. Apply force in swipe direction
 * 2. Run physics simulation until particles settle
 * 3. Detect and resolve collisions/merges
 * 4. Apply Life rules (births/deaths)
 * 5. Calculate scoring
 */
export function executeParticleTurn(
  context: ParticleTurnContext
): ParticleTurnOutcome {
  let workingField = context.field;
  let mergeCount = 0;

  // Step 1: Apply force based on swipe direction
  const [fx, fy] = getForceVector(context.direction);
  workingField = applyForce(
    workingField,
    fx,
    fy,
    context.forceStrength
  );

  // Step 2: Run physics simulation until particles settle
  let physicsSteps = 0;
  const maxSteps = context.maxPhysicsSteps;

  while (hasMovement(workingField, 0.005) && physicsSteps < maxSteps) {
    workingField = updatePhysics(workingField, context.physicsConfig);
    physicsSteps++;

    // Check for collisions and merge during physics
    // This prevents particles from passing through each other
    if (physicsSteps % 3 === 0) {
      const mergeResult = detectAndMergeCollisions(
        workingField,
        context.mergeOptions
      );
      workingField = mergeResult.field;
      mergeCount += mergeResult.merges;
    }
  }

  // Step 3: Final merge pass after settling
  const finalMerge = detectAndMergeCollisions(workingField, context.mergeOptions);
  workingField = finalMerge.field;
  mergeCount += finalMerge.merges;

  // Determine if anything actually moved
  const moved = physicsSteps > 0 || mergeCount > 0;

  if (!moved) {
    // No movement, return unchanged
    return {
      field: context.field,
      score: context.score,
      streakState: context.streakState,
      turnScore: 0,
      totalEnergy: calculateTotalEnergy(context.field),
      moved: false,
      merges: 0,
      births: 0,
      deaths: 0,
      stabilityIncremented: false,
      physicsSteps: 0
    };
  }

  // Step 4: Apply Life rules
  const lifeResult = particleLifeTick(workingField, context.lifeOptions);
  workingField = lifeResult.field;

  // Step 5: Calculate scoring
  const totalEnergy = calculateTotalEnergy(workingField);
  const hadBirthOrDeath = lifeResult.births > 0 || lifeResult.deaths > 0;
  const stabilityIncremented = !hadBirthOrDeath;

  const nextStreak = updateStreak(context.streakState, stabilityIncremented);
  const turnScore = totalEnergy * nextStreak.multiplier;
  const nextScore = context.score + turnScore;

  // Clear merge flags for next turn
  workingField = workingField.map((p) => ({
    ...p,
    mergedThisSwipe: false
  }));

  return {
    field: workingField,
    score: nextScore,
    streakState: nextStreak,
    turnScore,
    totalEnergy,
    moved: true,
    merges: mergeCount,
    births: lifeResult.births,
    deaths: lifeResult.deaths,
    stabilityIncremented,
    physicsSteps
  };
}

/**
 * Convert direction to force vector
 */
function getForceVector(
  direction: "up" | "down" | "left" | "right"
): [number, number] {
  switch (direction) {
    case "up":
      return [0, -1];
    case "down":
      return [0, 1];
    case "left":
      return [-1, 0];
    case "right":
      return [1, 0];
  }
}

/**
 * Calculate total energy of all alive particles
 */
function calculateTotalEnergy(field: ParticleField): number {
  return field
    .filter((p) => p.state === "alive" || p.state === "dormant")
    .reduce((sum, p) => sum + p.energy, 0);
}

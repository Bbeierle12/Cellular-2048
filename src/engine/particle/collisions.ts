import type { Particle } from "./particle";
import type { ParticleField } from "./field";
import {
  createAliveParticle,
  areColliding,
  isAlive,
  isDormant,
  distance
} from "./particle";

export interface MergeResult {
  field: ParticleField;
  merges: number;
}

export interface MergeOptions {
  eCap: number; // Maximum energy
}

/**
 * Detect and resolve particle collisions with merging
 */
export function detectAndMergeCollisions(
  field: ParticleField,
  options: MergeOptions
): MergeResult {
  let workingField = [...field];
  let mergeCount = 0;
  const merged = new Set<string>(); // Track which particles have merged

  // Simple O(n²) collision detection
  // For optimization: use spatial hashing or quadtree
  for (let i = 0; i < workingField.length; i++) {
    if (merged.has(workingField[i].id)) continue;

    const p1 = workingField[i];

    // Skip non-mergeable particles
    if (p1.state !== "alive" && p1.state !== "dormant") continue;
    if (p1.mergedThisSwipe) continue;

    for (let j = i + 1; j < workingField.length; j++) {
      if (merged.has(workingField[j].id)) continue;

      const p2 = workingField[j];

      // Skip non-mergeable particles
      if (p2.state !== "alive" && p2.state !== "dormant") continue;
      if (p2.mergedThisSwipe) continue;

      // Check collision
      if (areColliding(p1, p2)) {
        const result = mergeParticles(p1, p2, options);

        if (result) {
          // Mark both particles as merged
          merged.add(p1.id);
          merged.add(p2.id);

          // Add new merged particle
          workingField.push(result);
          mergeCount++;

          break; // p1 has merged, move to next particle
        }
      }
    }
  }

  // Remove merged particles
  workingField = workingField.filter((p) => !merged.has(p.id));

  return {
    field: workingField,
    merges: mergeCount
  };
}

/**
 * Merge two particles according to game rules
 */
function mergeParticles(
  p1: Particle,
  p2: Particle,
  options: MergeOptions
): Particle | null {
  // Both alive with same energy: merge into higher energy
  if (isAlive(p1) && isAlive(p2) && p1.energy === p2.energy) {
    const newEnergy = Math.min(p1.energy + 1, options.eCap);
    const avgX = (p1.x + p2.x) / 2;
    const avgY = (p1.y + p2.y) / 2;

    // Combine momentum
    const totalMass = p1.mass + p2.mass;
    const newVx = (p1.vx * p1.mass + p2.vx * p2.mass) / totalMass;
    const newVy = (p1.vy * p1.mass + p2.vy * p2.mass) / totalMass;

    const merged = createAliveParticle(
      avgX,
      avgY,
      newEnergy,
      `merged-${p1.id}-${p2.id}-${Date.now()}`
    );

    merged.vx = newVx;
    merged.vy = newVy;
    merged.mergedThisSwipe = true;
    merged.mergeAnimation = 1.0; // Start merge animation

    return merged;
  }

  // Both alive with different energy: higher absorbs lower
  if (isAlive(p1) && isAlive(p2) && p1.energy !== p2.energy) {
    const [higher, lower] = p1.energy > p2.energy ? [p1, p2] : [p2, p1];
    const newEnergy = Math.max(1, higher.energy - 1);

    // Position favors the higher energy particle
    const t = 0.7; // 70% towards higher energy particle
    const newX = higher.x * t + lower.x * (1 - t);
    const newY = higher.y * t + lower.y * (1 - t);

    // Momentum transfer
    const totalMass = higher.mass + lower.mass * 0.5; // Lower contributes less
    const newVx = (higher.vx * higher.mass + lower.vx * lower.mass * 0.5) / totalMass;
    const newVy = (higher.vy * higher.mass + lower.vy * lower.mass * 0.5) / totalMass;

    const merged = createAliveParticle(
      newX,
      newY,
      newEnergy,
      `merged-${higher.id}-${lower.id}-${Date.now()}`
    );

    merged.vx = newVx;
    merged.vy = newVy;
    merged.mergedThisSwipe = true;
    merged.mergeAnimation = 1.0;

    return merged;
  }

  // Alive meets dormant
  if (
    (isAlive(p1) && isDormant(p2)) ||
    (isDormant(p1) && isAlive(p2))
  ) {
    const alive = isAlive(p1) ? p1 : p2;
    const dormant = isDormant(p1) ? p1 : p2;

    const newEnergy = Math.max(1, Math.max(alive.energy, dormant.energy) - 1);
    const avgX = (alive.x + dormant.x) / 2;
    const avgY = (alive.y + dormant.y) / 2;

    const totalMass = alive.mass + dormant.mass;
    const newVx = (alive.vx * alive.mass + dormant.vx * dormant.mass) / totalMass;
    const newVy = (alive.vy * alive.mass + dormant.vy * dormant.mass) / totalMass;

    const merged = createAliveParticle(
      avgX,
      avgY,
      newEnergy,
      `merged-${alive.id}-${dormant.id}-${Date.now()}`
    );

    merged.vx = newVx;
    merged.vy = newVy;
    merged.mergedThisSwipe = true;
    merged.mergeAnimation = 1.0;
    merged.noMergeTicks = 0;

    return merged;
  }

  return null;
}

/**
 * Find neighbors within a certain radius
 */
export function findNeighbors(
  particle: Particle,
  field: ParticleField,
  radius: number
): ParticleField {
  return field.filter(
    (p) => p.id !== particle.id && distance(particle, p) <= radius
  );
}

/**
 * Count alive neighbors within radius
 */
export function countAliveNeighbors(
  particle: Particle,
  field: ParticleField,
  radius: number = 0.15
): number {
  return field.filter(
    (p) => p.id !== particle.id && isAlive(p) && distance(particle, p) <= radius
  ).length;
}

import type { Particle } from "./particle";
import type { ParticleField } from "./field";
import {
  createAliveParticle,
  isAlive,
  isDormant,
  cloneParticle
} from "./particle";
import { countAliveNeighbors, findNeighbors } from "./collisions";

export interface ParticleLifeOptions {
  birthRule: "2-3" | "3"; // Birth on 2-3 or exactly 3 neighbors
  neighborRadius: number; // Radius to count neighbors
  birthRadius: number;    // Radius to check for potential birth locations
  maxBirths: number;      // Maximum births per tick
}

export interface LifeTickResult {
  field: ParticleField;
  births: number;
  deaths: number;
  bornPositions: Array<{ x: number; y: number }>;
}

/**
 * Apply Conway's Game of Life rules in continuous space
 */
export function particleLifeTick(
  field: ParticleField,
  options: ParticleLifeOptions
): LifeTickResult {
  const nextField: ParticleField = [];
  let births = 0;
  let deaths = 0;
  const bornPositions: Array<{ x: number; y: number }> = [];

  // Step 1: Check survival of existing alive particles
  for (const particle of field) {
    if (isAlive(particle)) {
      const aliveNeighbors = countAliveNeighbors(
        particle,
        field,
        options.neighborRadius
      );

      // Survival rule: 2-3 neighbors
      if (aliveNeighbors === 2 || aliveNeighbors === 3) {
        nextField.push(cloneParticle(particle));
      } else {
        deaths++;
        // Particle dies (not added to nextField)
      }
    } else {
      // Keep non-alive particles (dormant, catalyst, blight)
      nextField.push(cloneParticle(particle));
    }
  }

  // Step 2: Check for births in empty space
  // We'll sample potential birth locations around existing particles
  const birthCandidates = generateBirthCandidates(field, options);
  
  for (const candidate of birthCandidates) {
    if (births >= options.maxBirths) break;

    const aliveNeighbors = countAliveNeighborsAt(
      candidate.x,
      candidate.y,
      field,
      options.neighborRadius
    );

    // Birth rule
    const shouldBirth =
      options.birthRule === "2-3"
        ? aliveNeighbors === 2 || aliveNeighbors === 3
        : aliveNeighbors === 3;

    if (shouldBirth) {
      // Check if location is clear (not too close to existing particles)
      const tooClose = nextField.some(
        (p) => {
          const dx = p.x - candidate.x;
          const dy = p.y - candidate.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist < p.radius * 2;
        }
      );

      if (!tooClose) {
        const newParticle = createAliveParticle(
          candidate.x,
          candidate.y,
          1,
          `born-${candidate.x.toFixed(3)}-${candidate.y.toFixed(3)}-${Date.now()}`
        );
        newParticle.age = 0;
        nextField.push(newParticle);
        bornPositions.push({ x: candidate.x, y: candidate.y });
        births++;
      }
    }
  }

  return {
    field: nextField,
    births,
    deaths,
    bornPositions
  };
}

/**
 * Generate candidate positions for birth
 * Sample points around existing alive particles
 */
function generateBirthCandidates(
  field: ParticleField,
  options: ParticleLifeOptions
): Array<{ x: number; y: number }> {
  const candidates: Array<{ x: number; y: number }> = [];
  const aliveParticles = field.filter(isAlive);

  // For each alive particle, sample points around it
  const samplesPerParticle = 8;
  const radius = options.birthRadius;

  for (const particle of aliveParticles) {
    for (let i = 0; i < samplesPerParticle; i++) {
      const angle = (i / samplesPerParticle) * Math.PI * 2;
      const x = particle.x + Math.cos(angle) * radius;
      const y = particle.y + Math.sin(angle) * radius;

      // Keep within bounds
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        candidates.push({ x, y });
      }
    }
  }

  return candidates;
}

/**
 * Count alive neighbors at a specific position
 */
function countAliveNeighborsAt(
  x: number,
  y: number,
  field: ParticleField,
  radius: number
): number {
  return field.filter((p) => {
    if (!isAlive(p)) return false;
    const dx = p.x - x;
    const dy = p.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= radius;
  }).length;
}

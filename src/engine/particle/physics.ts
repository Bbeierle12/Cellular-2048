import type { Particle } from "./particle";
import type { ParticleField } from "./field";
import { cloneParticle } from "./particle";

export interface PhysicsConfig {
  damping: number;          // Velocity damping (0-1)
  wallBounce: number;       // Wall bounce coefficient (0-1)
  minVelocity: number;      // Velocity below this is set to 0
  maxVelocity: number;      // Maximum velocity magnitude
  dt: number;               // Time step
}

export const defaultPhysicsConfig: PhysicsConfig = {
  damping: 0.95,
  wallBounce: 0.6,
  minVelocity: 0.001,
  maxVelocity: 2.0,
  dt: 1.0
};

/**
 * Apply a force to all particles in the field
 */
export function applyForce(
  field: ParticleField,
  fx: number,
  fy: number,
  strength: number = 0.15
): ParticleField {
  return field.map((p) => {
    // Only apply force to alive and dormant particles
    if (p.state !== "alive" && p.state !== "dormant") {
      return p;
    }

    // Force is inversely proportional to mass
    const acceleration = strength / p.mass;

    return {
      ...p,
      vx: p.vx + fx * acceleration,
      vy: p.vy + fy * acceleration
    };
  });
}

/**
 * Update particle physics (position, velocity, bouncing)
 */
export function updatePhysics(
  field: ParticleField,
  config: PhysicsConfig = defaultPhysicsConfig
): ParticleField {
  return field.map((p) => {
    let particle = cloneParticle(p);

    // Update position
    particle.x += particle.vx * config.dt;
    particle.y += particle.vy * config.dt;

    // Apply damping
    particle.vx *= config.damping;
    particle.vy *= config.damping;

    // Wall collisions with bounce
    if (particle.x < particle.radius) {
      particle.x = particle.radius;
      particle.vx = Math.abs(particle.vx) * config.wallBounce;
    } else if (particle.x > 1 - particle.radius) {
      particle.x = 1 - particle.radius;
      particle.vx = -Math.abs(particle.vx) * config.wallBounce;
    }

    if (particle.y < particle.radius) {
      particle.y = particle.radius;
      particle.vy = Math.abs(particle.vy) * config.wallBounce;
    } else if (particle.y > 1 - particle.radius) {
      particle.y = 1 - particle.radius;
      particle.vy = -Math.abs(particle.vy) * config.wallBounce;
    }

    // Stop very slow particles
    if (Math.abs(particle.vx) < config.minVelocity) particle.vx = 0;
    if (Math.abs(particle.vy) < config.minVelocity) particle.vy = 0;

    // Cap maximum velocity
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    if (speed > config.maxVelocity) {
      const scale = config.maxVelocity / speed;
      particle.vx *= scale;
      particle.vy *= scale;
    }

    // Increment age
    particle.age += config.dt;

    return particle;
  });
}

/**
 * Check if a particle is moving (has non-zero velocity)
 */
export function isMoving(particle: Particle, threshold: number = 0.01): boolean {
  return Math.abs(particle.vx) > threshold || Math.abs(particle.vy) > threshold;
}

/**
 * Check if any particles in the field are still moving
 */
export function hasMovement(
  field: ParticleField,
  threshold: number = 0.01
): boolean {
  return field.some((p) => isMoving(p, threshold));
}

/**
 * Get velocity magnitude
 */
export function getSpeed(particle: Particle): number {
  return Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
}

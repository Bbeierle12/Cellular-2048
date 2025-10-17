import { createAliveParticle, type Particle } from "./particle";

export type ParticleField = Particle[];

/**
 * Create initial particle field with random positions
 */
export function createParticleField(
  count: number,
  seed: () => number
): ParticleField {
  const particles: ParticleField = [];
  const minDistance = 0.1; // Minimum distance between starting particles
  const maxAttempts = 100;

  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    let attempts = 0;
    let validPosition = false;

    // Try to find a position that's not too close to existing particles
    while (!validPosition && attempts < maxAttempts) {
      x = 0.1 + seed() * 0.8; // Keep away from edges
      y = 0.1 + seed() * 0.8;

      validPosition = particles.every((p) => {
        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist >= minDistance;
      });

      attempts++;
    }

    if (validPosition || attempts >= maxAttempts) {
      particles.push(createAliveParticle(x!, y!, 1, `particle-${i}`));
    }
  }

  return particles;
}

/**
 * Clone the entire particle field
 */
export function cloneField(field: ParticleField): ParticleField {
  return field.map((p) => ({ ...p }));
}

/**
 * Count particles by state
 */
export function countByState(field: ParticleField): Record<string, number> {
  return field.reduce((acc, p) => {
    acc[p.state] = (acc[p.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get all alive particles
 */
export function getAliveParticles(field: ParticleField): ParticleField {
  return field.filter((p) => p.state === "alive");
}

/**
 * Remove a particle from the field
 */
export function removeParticle(field: ParticleField, id: string): ParticleField {
  return field.filter((p) => p.id !== id);
}

/**
 * Add a particle to the field
 */
export function addParticle(field: ParticleField, particle: Particle): ParticleField {
  return [...field, particle];
}

/**
 * Replace a particle in the field
 */
export function replaceParticle(
  field: ParticleField,
  id: string,
  newParticle: Particle
): ParticleField {
  return field.map((p) => (p.id === id ? newParticle : p));
}

import type { CellState } from "../grid/cell";

/**
 * A particle in continuous 2D space with physics properties
 */
export interface Particle {
  id: string;
  state: CellState;
  energy: number;
  
  // Position (normalized 0-1)
  x: number;
  y: number;
  
  // Velocity
  vx: number;
  vy: number;
  
  // Physics properties
  mass: number;        // Affects inertia
  radius: number;      // Collision detection and visual size
  
  // Game state
  noMergeTicks?: number;
  mergedThisSwipe?: boolean;
  colonyEligible?: boolean;
  hazardCharges?: number;
  
  // Visual effects
  age: number;         // Time since creation (for trail effects)
  mergeAnimation?: number; // Animation timer for merges
}

export function createAliveParticle(
  x: number,
  y: number,
  energy: number,
  id: string
): Particle {
  return {
    id,
    state: "alive",
    energy,
    x,
    y,
    vx: 0,
    vy: 0,
    mass: 1 + energy * 0.1, // Heavier particles have more energy
    radius: 0.02 + energy * 0.005, // Larger visual size with more energy
    age: 0
  };
}

export function createDormantParticle(
  x: number,
  y: number,
  energy: number,
  id: string
): Particle {
  return {
    id,
    state: "dormant",
    energy,
    x,
    y,
    vx: 0,
    vy: 0,
    mass: 1 + energy * 0.1,
    radius: 0.02 + energy * 0.005,
    noMergeTicks: 0,
    age: 0
  };
}

export function createCatalystParticle(x: number, y: number, id: string): Particle {
  return {
    id,
    state: "catalyst",
    energy: 0,
    x,
    y,
    vx: 0,
    vy: 0,
    mass: 0.5,
    radius: 0.025,
    age: 0
  };
}

export function createBlightParticle(
  x: number,
  y: number,
  id: string,
  charges = 1
): Particle {
  return {
    id,
    state: "blight",
    energy: 0,
    x,
    y,
    vx: 0,
    vy: 0,
    mass: 0.8,
    radius: 0.03,
    hazardCharges: charges,
    age: 0
  };
}

export function cloneParticle(particle: Particle): Particle {
  return { ...particle };
}

export function isAlive(particle: Particle): boolean {
  return particle.state === "alive";
}

export function isDormant(particle: Particle): boolean {
  return particle.state === "dormant";
}

export function isBlight(particle: Particle): boolean {
  return particle.state === "blight";
}

export function isCatalyst(particle: Particle): boolean {
  return particle.state === "catalyst";
}

/**
 * Calculate distance between two particles
 */
export function distance(p1: Particle, p2: Particle): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two particles are colliding
 */
export function areColliding(p1: Particle, p2: Particle): boolean {
  return distance(p1, p2) < (p1.radius + p2.radius);
}

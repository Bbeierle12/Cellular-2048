// Core types
export type { Particle } from "./particle";
export type { ParticleField } from "./field";
export type { PhysicsConfig } from "./physics";
export type { MergeOptions, MergeResult } from "./collisions";
export type { ParticleLifeOptions, LifeTickResult } from "./life";

// Particle creation and utilities
export {
  createAliveParticle,
  createDormantParticle,
  createCatalystParticle,
  createBlightParticle,
  cloneParticle,
  isAlive,
  isDormant,
  isBlight,
  isCatalyst,
  distance,
  areColliding
} from "./particle";

// Field management
export {
  createParticleField,
  cloneField,
  countByState,
  getAliveParticles,
  removeParticle,
  addParticle,
  replaceParticle
} from "./field";

// Physics
export {
  applyForce,
  updatePhysics,
  isMoving,
  hasMovement,
  getSpeed,
  defaultPhysicsConfig
} from "./physics";

// Collisions and merging
export {
  detectAndMergeCollisions,
  findNeighbors,
  countAliveNeighbors
} from "./collisions";

// Life rules
export { particleLifeTick } from "./life";

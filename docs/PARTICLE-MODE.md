# Particle Mode - Abstract 2048

## Overview

Particle Mode transforms Cellular 2048 from a fixed grid into a **dynamic particle swarm** where tiles exist as free-floating entities in continuous 2D space. This creates an organic, fluid gameplay experience while maintaining the core merge mechanics and Conway's Life rules.

## What Changed?

### From Grid to Particles
- **No fixed positions**: Particles move freely in normalized (0-1) space
- **Physics simulation**: Real velocity, momentum, inertia, and collisions
- **Continuous space**: No discrete cells, smooth interpolation
- **Force-based controls**: Swipes apply directional forces instead of instant movement

### Visual Differences
- **Glowing orbs** instead of square tiles
- **Motion trails** showing particle paths
- **Smooth animations** with merge effects
- **Dynamic sizing** based on energy levels
- **Organic movement** with wall bouncing and damping

## How It Works

### 1. Particle System
Each particle has:
- **Position** (x, y): Normalized 0-1 coordinates
- **Velocity** (vx, vy): Current speed and direction
- **Mass**: Based on energy (affects inertia)
- **Radius**: Size for collision detection and rendering
- **Energy**: Same as grid mode (1 to eCap)
- **State**: alive, dormant, catalyst, blight

### 2. Physics Engine
Every turn simulates:
```
1. Apply force from swipe direction
2. Update positions based on velocity
3. Apply damping (friction)
4. Handle wall collisions with bounce
5. Detect particle collisions
6. Merge particles that collide
7. Repeat until particles settle
```

### 3. Collision & Merging
- **Same energy**: Merge into higher energy (E+1)
- **Different energy**: Higher absorbs lower (E-1)
- **Alive + Dormant**: Wake dormant, reduce energy
- **Momentum conservation**: Combined velocity weighted by mass

### 4. Life Rules in Continuous Space
Instead of 8-grid neighbors, we use **radius-based neighborhoods**:
- **Neighbor radius**: 0.15 units (configurable)
- **Birth radius**: 0.12 units for spawn location checks
- **Survival**: 2-3 alive neighbors within radius
- **Birth**: Sample points around particles, check neighbor count

### 5. Turn Execution
```
1. Apply force (swipe) → all particles accelerate
2. Run physics loop → particles move and collide
3. Merge colliding particles → combine energy/momentum
4. Life tick → births/deaths based on neighborhoods
5. Calculate score → same as grid mode
```

## Key Files Created

### Core Particle System
- `src/engine/particle/particle.ts` - Particle type and utilities
- `src/engine/particle/field.ts` - Particle field management
- `src/engine/particle/physics.ts` - Force, velocity, position updates
- `src/engine/particle/collisions.ts` - Collision detection and merging
- `src/engine/particle/life.ts` - Conway's Life in continuous space
- `src/engine/particle/index.ts` - Public API exports

### Game Integration
- `src/engine/particle-turn.ts` - Complete turn execution for particle mode
- `src/state/types.ts` - Added `mode` field and `ParticleField` support
- `src/state/reducers.ts` - Dual mode support (grid/particle)
- `src/ui/components/ParticleCanvas.tsx` - Particle visualization
- `src/ui/components/GridCanvas.tsx` - Mode switching support

## Controls

### Same as Grid Mode
- **Arrow keys / WASD** - Apply force in direction
- **R** - Reset game
- **G** - Toggle Life preview (grid mode only)

### New
- **M** - Toggle between Grid and Particle mode

## Physics Parameters

### Tunable Values
```typescript
PhysicsConfig {
  damping: 0.95,          // Velocity decay per tick
  wallBounce: 0.6,        // Bounce elasticity
  minVelocity: 0.001,     // Stop threshold
  maxVelocity: 2.0,       // Speed cap
  dt: 1.0                 // Time step
}

ForceStrength: 0.2        // Swipe force magnitude
MaxPhysicsSteps: 60       // Max simulation ticks
```

### Life Parameters
```typescript
ParticleLifeOptions {
  birthRule: "2-3" | "3", // Same as grid
  neighborRadius: 0.15,    // Range to count neighbors
  birthRadius: 0.12,       // Sampling radius for births
  maxBirths: 10            // Birth limit per turn
}
```

## Performance

### Current Implementation
- **O(n²) collision detection**: Simple but works for <100 particles
- **Physics steps**: 60 max, typically settles in 10-20
- **Rendering**: Canvas 2D with trails and glow effects

### Optimizations (Future)
- Spatial hashing for O(n) collisions
- Quadtree for broad-phase collision detection
- WebGL rendering for particle effects
- Predictive settling (skip redundant physics steps)

## Gameplay Differences

### Strategy Changes
- **Momentum matters**: Particles keep moving after swipe
- **Clustering important**: Particles near each other interact
- **Positioning crucial**: Particles can scatter unpredictably
- **Timing critical**: Must wait for settling before next move

### Emergent Behaviors
- **Orbits**: Particles can circle each other
- **Chains**: Line of particles can push together
- **Explosions**: High-energy merges scatter neighbors
- **Stability zones**: Corners provide natural clustering

## Visual Features

### Implemented
- ✅ Particle glow (energy-based)
- ✅ Motion trails (last 10 positions)
- ✅ Merge animations (expanding ring)
- ✅ Energy display (numbers on particles)
- ✅ State-based colors (alive, dormant, etc.)
- ✅ Size scaling (larger = more energy)

### Potential Enhancements
- 🔲 Particle-particle attraction/repulsion forces
- 🔲 Energy-based particle interactions
- 🔲 Colony visualization (connections between neighbors)
- 🔲 Velocity-based color shifting
- 🔲 Turbulence effects
- 🔲 Screen shake on merges
- 🔲 Particle splitting mechanic

## Technical Notes

### Normalized Space
All particle positions are 0-1 normalized:
- `(0, 0)` = top-left
- `(1, 1)` = bottom-right
- Canvas size independent
- Scales to any resolution

### State Synchronization
- Grid and particle modes share same `GameState`
- Switching modes resets the game
- Both maintain same difficulty/scoring rules
- Telemetry tracks both modes

### Compatibility
- Works with all existing features:
  - Scoring and streaks ✅
  - Difficulty levels ✅
  - Energy tracking ✅
  - Win/lose conditions ✅
- Not yet implemented:
  - Blight/catalyst hazards ⏸️
  - Dormancy system ⏸️
  - Decay mechanics ⏸️

## Future Directions

### Hybrid Mode
Combine grid and particles:
- Grid provides structure
- Particles move between cells
- Best of both worlds

### 3D Particle Mode
Extend to 3D space:
- Particles in a cube
- Camera rotation
- Depth-based interactions

### Network Forces
Add spring forces between related particles:
- Connect neighboring particles
- Create elastic structures
- Visualize colonies as networks

### Procedural Effects
Generative visual enhancements:
- Particle trails morph based on energy
- Glow pulses with game rhythm
- Background reacts to movements

## Comparison: Grid vs Particle

| Aspect | Grid Mode | Particle Mode |
|--------|-----------|---------------|
| Movement | Discrete slides | Continuous physics |
| Merging | Sequential, line-by-line | Simultaneous, collision-based |
| Strategy | Predictable | Emergent |
| Difficulty | Medium | Higher (chaos factor) |
| Visuals | Clean, structured | Organic, dynamic |
| Performance | Fast | Moderate |
| Determinism | Fully deterministic | Physics-dependent |

## Try It!

1. Start the game in **Particle Mode** (default)
2. **Swipe** to apply force - watch particles fly!
3. Wait for particles to **settle** and **collide**
4. **Merges** create larger, glowing particles
5. **Life rules** spawn new particles in dense areas
6. Press **M** to compare with Grid Mode

---

**Particle Mode** makes Cellular 2048 into a mesmerizing, fluid experience where strategy meets chaos. Enjoy the swarm! 🌊✨

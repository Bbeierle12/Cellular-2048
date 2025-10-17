# Cellular 2048 — Plan of Action

This plan turns the high-level concept into a shippable game with a deterministic rules engine, clear UX, and difficulty progression. It includes assumptions where the spec is under-defined; these are marked as Tunable and can be adjusted in playtests.

## Goals
- Build a deterministic, testable rules engine for swipe + Life-tick gameplay.
- Deliver an immediately playable web prototype with ghost next-tick preview and energy rings.
- Implement blight and catalyst systems, scoring, and difficulty progression.
- Balance for early/mid/late phases with tunable parameters.

## Milestones and Deliverables
1) Spec & Decisions (2–3 days)
- DESIGN.md: precise event order, merge semantics, dormancy, births, deaths, blight shielding, catalyst behavior.
- Platform decision: Web (TypeScript + Vite + React + Canvas2D).
- Acceptance: all rules written, 10+ edge cases documented, unit-test plan drafted.

2) Rules Engine (4–6 days)
- Pure TS engine (no DOM) implementing: swipes, merges, births, deaths, dormancy, scoring hooks.
- Unit tests: swipe determinism, merge tie-breakers, birth/death parity, dormancy timer.
- Acceptance: 95%+ test pass on 40+ tests; determinism preserved with seeded RNG.

3) UI Prototype (3–5 days)
- Grid rendering, ghost next-tick preview, energy rings, swipe input, basic animations.
- Acceptance: Responsive 6x6–8x8, 60 FPS on mid hardware, visual parity with engine state.

4) Hazards & Powerups (3–4 days)
- Blight (infection + shielding) and Catalyst (double E on collision, consumed).
- Acceptance: Feature flags toggleable; tests for shielding edge cases.

5) Scoring & Progression (2–3 days)
- Stabilize goal and endless scoring with streak multipliers.
- Early/Mid/Late parameter tables, runtime switching.
- Acceptance: Win/loss conditions verifiable; telemetry captures births/deaths/streaks.

6) Balancing & Polish (ongoing)
- Analytics review, parameter tuning, accessibility (colorblind-safe rings), SFX.
- Acceptance: Player completes early and mid stages reliably; late provides challenge.

## Core Mechanics (spec v1)

Event order per turn:
1. Player swipe (N/E/S/W)
   - Compress and move live cells in lines along the swipe direction.
   - Resolve merges deterministically from the lead edge outward.
   - Apply merges (see Merge Rules) and produce the post-swipe board.
   - Catalyst pass: if any moving live cell passes through or ends on a catalyst tile this move, immediately double its E (capped); consume the catalyst.
2. Life tick (modified Conway’s GoL)
   - Neighbor count uses only alive cells (dormant do not count as alive).
   - Survival: alive with 2–3 alive neighbors stays alive; else it dies (empties).
   - Birth: exactly 3 alive neighbors creates a new alive cell at E=1.
3. Dormancy update
   - Any alive cell with E=1 that did not merge during the preceding swipe increments a “no-merge” tick counter; upon reaching 3, it becomes dormant (E stays 1).
   - If a dormant cell merges on a later swipe (see Dormant Merges), it becomes alive again and counter resets.
4. Blight & Decay (if enabled this phase)
   - Blight step occurs after Life resolution (see Blight Rules); energy decay for isolated cells may apply here in Mid/Late.
5. Scoring
   - Add to score: sum of E across all alive cells.
   - If this tick had no births and no deaths, increment stability streak and apply multiplier; else reset streak.

Merge rules (during swipe only):
- Same-E merges: (alive, E) + (alive, E) -> (alive, E+1), capped by E_cap (8 early/mid; 10 late).
- Unequal merges: higher-E absorbs lower-E -> (alive, max(E_high - 1, 1)). Lower-E is removed.
- Dormant merges: (dormant, Ed) + (alive, Ea) -> (alive, max(Ed, Ea) - 1). Counter resets.
- Multi-merge policy: A cell can participate in at most one merge per swipe step. Resulting merged cells are marked “merged” and cannot merge again until the next swipe, ensuring determinism similar to 2048.
- Colony bonus (Tunable): If a merge occurs where both participants are part of a connected component of size ≥ 4 (alive pre-merge), grant +1 E to the result before capping.
- Minimum E is 1 for any surviving alive cell.

Blight rules (mid/late):
- Spawn: On configured intervals/probability, a blight token appears on an empty cell (seeded RNG). Optionally visible telegraph one turn earlier.
- Effect: On the Blight step, each blight token attempts to convert orthogonally adjacent alive cells to dormant.
- Shielding: A target cell is immune if its 3x3 neighborhood forms a still life (unchanged after one Life tick) or is in a period-2 oscillator (unchanged after two ticks). Implementation: simulate 2 ticks on the local 5x5 neighborhood to decide immunity.
- Persistence: Blight tokens expire after applying once (Tunable: linger 1–2 steps in late).

Catalyst rules:
- Spawn: Rare; seeded RNG, max N catalysts concurrently.
- Effect: During the swipe compression, if a live cell’s path intersects a catalyst tile, double its E immediately (capped), then remove the catalyst.
- One-move only: No effect outside the move where collision occurs.

Isolation decay (mid/late):
- After the Life tick, any alive cell with 0–1 alive neighbors loses 1 E (not below 1). If it reaches E=1, its dormancy counter may progress as usual.

Stabilize goal and scoring:
- Stabilize: Board has no births and no deaths during the Life tick, and total live E ≥ threshold (Tunable by board size/difficulty). Requires one full cycle (swipe+tick) stable.
- Endless score: Sum of E across alive cells after each tick.
- Streak multiplier: +0.25 per consecutive stable cycle up to 3.0x cap (Tunable). Resets on any birth/death.

## Rules Assumptions (Tunable)
- Dormant are static and do not contribute to neighbor counts.
- Births produce (alive, E=1) regardless of phase.
- Early difficulty “relaxed birth rules”: allow births on 2 or 3 neighbors (instead of exactly 3). Mid/Late return to exactly 3. This is tunable.
- Swipe determinism: line resolution order is front-to-back along the swipe direction; ties resolved by positional order only.
- Unequal merges cannot create E=0; floor at E=1.
- Colony bonus count checks pre-merge connected components of alive cells (4-connectivity). Bonus applies once per merge.

## Data Model
- Cell: { kind: 'alive' | 'dormant' | 'empty', E: number (1..E_cap), noMergeTicks?: number }
- Board: 2D grid (width x height), fixed size per game.
- Entities: { blight: Set<pos>, catalysts: Set<pos> }
- RNG: seed, next() for deterministic hazards/spawns.
- GameState: { board, entities, score, streak, turn, phase, params }
- Params: { E_cap, earlyBirthRelaxation, blightRate, decayEnabled, decayAmount, catalystRate, colonyBonusEnabled, stabilizeThreshold }

## Algorithms (high level)
- swipe(direction):
  1) For each line, gather movable cells in order of movement.
  2) Sweep forward, forming an output list; apply merge rules with one-merge-per-result constraint.
  3) Track paths to detect catalyst collisions; apply doubling immediately.
  4) Write back compressed line to grid; clear trailing cells.
- lifeTick():
  1) Compute neighbor counts from alive cells only.
  2) Apply survival/death; compute births (E=1) for exactly-3 (or relaxed) neighbors.
- dormancyUpdate():
  - For alive E=1 that did not merge last swipe, increment noMergeTicks and convert to dormant at 3.
- blightStep():
  - For each blight token, check adjacent alive cells; simulate local neighborhood up to 2 ticks to determine shield; convert unshielded to dormant.
- decayStep():
  - For alive cells with 0–1 neighbors, E = max(E-1, 1).
- scoringStep():
  - sumE = sum(E of alive); if no births/deaths this tick: streak++; multiplier = 1 + 0.25*(streak-1) (cap). score += sumE * multiplier.

## Edge Cases to Validate
- Triple merge attempts in one line: only the first merge occurs; the resulting tile cannot merge again this swipe.
- Dormant in the path: alive moving into dormant triggers dormant merge rule.
- Unequal merges at E=1: higher-E absorbs (result at least 1).
- Cap handling: E never exceeds E_cap even after catalyst and colony bonus.
- Birth into blight tile: life tick then blight; newborn may be converted unless shielded.
- Catalyst collision when two cells pass same tile in same swipe: first mover in resolution order gains effect; catalyst consumed.

## Difficulty Curve (parameter tables v1)
- Early:
  - E_cap: 8
  - Births: relaxed (2 or 3 neighbors)
  - Blight: off
  - Decay: off
  - CatalystRate: low
  - StabilizeThreshold: moderate (e.g., 20–30 on 6x6)
- Mid:
  - E_cap: 8
  - Births: exactly 3
  - Blight: on (low rate)
  - Decay: on (isolated -1 E)
  - CatalystRate: low
- Late:
  - E_cap: 10
  - Blight: higher rate; blight may linger 2 steps
  - Decay: on (isolated -1 or -2 E tunable)
  - CatalystRate: low–medium

## UX Implementation Notes
- Ghost next-tick preview: run lifeTick on an offscreen copy; render faint ghost cells where births/survivals occur; highlight deaths as fading outlines.
- Energy rings: draw segmented arcs equal to E value; color ramps by E; ensure colorblind-safe palette.
- Swipe input: mouse drag / touch; keyboard arrows for desktop; subtle easing on tile slides.
- Performance: retain neighbor counts; incremental updates; canvas batching.

## Testing Strategy
- Unit tests (engine): merges, births/deaths, dormancy, blight shielding micro-sims, catalyst collisions, isolation decay.
- Property tests: invariants (E ≥ 1, <= E_cap; determinism under seed).
- Snapshot tests: engine states after scripted swipes.
- Integration tests: ghost preview matches engine prediction.

## Telemetry for Balancing (dev only)
- Track per-turn: births, deaths, merges, average E, isolated cells, blight hits, catalyst uses, stability streak length.

## Open Questions (to tune during playtests)
- Exact colony bonus trigger size and magnitude (+1 vs +E_low fraction).
- Early relaxed birth rule (2 or 3) vs (3 or 4).
- Blight spawn telegraph and linger behavior.
- Decay amount in late difficulty.

## Next Steps
1) Write DESIGN.md with final rule wording and examples.
2) Scaffold Vite + React + TS; set up engine package and test harness (Vitest).
3) Implement swipe + merges; add 20 unit tests.
4) Add lifeTick + dormancy; add 20 unit tests.
5) Render prototype with ghost preview and energy rings.
6) Add blight and catalyst; test shielding.
7) Wire scoring, streaks, and progression; instrument telemetry.
8) Playtest and tune parameters; lock v1.0 rules.

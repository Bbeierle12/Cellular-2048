# Cellular 2048 — Mechanics Spec (DESIGN)

Authoritative rules for the deterministic engine, including event order, merges, Life tick, dormancy, hazards, scoring, and edge cases. This is engine-agnostic; terms assume a 2D grid with integer coordinates.

## 1) Board, coordinates, and neighbors
- Grid: width x height, 0-based coordinates (x, y), x increases to the right, y increases downward.
- Cell kinds: `empty`, `alive(E)`, `dormant(E)` with 1 ≤ E ≤ E_cap.
- Neighbor model for Life: Moore neighborhood (8 neighbors).
- Connectivity for colony checks: 4-connected (orthogonal) unless otherwise noted.

## 2) Turn sequence (per swipe)
Each turn consists of five ordered phases. All randomness must be seeded and deterministic.

1. Swipe phase (player input N/E/S/W)
   - Compress rows/columns along the swipe direction.
   - Apply merges while compressing (see Section 3). Track whether each alive cell merged this swipe.
   - Catalyst collisions occur during movement (see Section 5). Multiple collisions in one path count as a single application (first collision doubles and consumes the catalyst; further catalysts on that same path have no effect this move).
2. Life tick (modified Conway’s GoL)
   - Compute alive neighbor counts using only `alive` cells (dormant are not alive).
   - Survival: an `alive` cell survives iff it has 2 or 3 alive neighbors; otherwise it dies (becomes `empty`). Energy E is irrelevant to survival.
   - Birth: any `empty` cell with exactly 3 alive neighbors becomes `alive(1)`.
   - Early-difficulty relaxation (tunable): allow births on 2 or 3 neighbors instead of exactly 3.
3. Dormancy update
   - For each `alive` cell with E=1 that did not participate in a merge during the immediately preceding Swipe phase, increment its `noMergeTicks` counter; when it reaches 3, convert it to `dormant(1)` and reset counter.
   - On any merge participation (as source or target) or on becoming newly born this tick, reset `noMergeTicks` to 0.
4. Hazards & decay (difficulty-dependent)
   - Blight step: blight tokens attempt to convert orthogonally adjacent `alive` cells to `dormant` unless shielded (Section 6).
   - Isolation decay: if enabled, any `alive` cell with ≤1 alive neighbors loses 1 E (down to minimum 1). This happens after blight conversions are resolved.
5. Scoring step
   - Add to score: sum of E over all `alive` cells.
   - Stability check: if this Life tick had zero births and zero deaths, increment stability streak; otherwise reset streak to 0. Apply streak multiplier to the sum for final turn score (Section 8).

All state updates within a phase are simultaneous for that phase (compute on a snapshot, then apply), except the Swipe phase which resolves merges sequentially per line according to resolution order (deterministic, see below).

## 3) Swipe movement and merges

### 3.1 Line formation
- For swipe Right: process each row from rightmost destination edge to left; movable list built from right to left.
- For swipe Left: process each row from left to right; list from left to right.
- For swipe Down: process each column from bottom to top; list from bottom to top.
- For swipe Up: process each column from top to bottom; list from top to bottom.

Within each line:
- Consider non-empty cells (alive or dormant) in movement order.
- Build an output list by pushing cells towards the leading edge, resolving merges on contact according to 3.2–3.4.
- One-merge-per-result: A newly formed result in this swipe becomes marked `mergedThisSwipe=true` and cannot merge again until next swipe. This ensures determinism similar to classic 2048.

### 3.2 Same-E merges (alive vs alive)
- If two adjacent movable `alive` cells of equal E collide during compression:
  - Result: `alive(E+1)`.
  - Cap at E_cap; any excess is lost (no carryover).
  - Source cells are removed; resulting cell is marked `mergedThisSwipe=true`.

### 3.3 Unequal merges (alive absorbs alive)
- If two `alive` cells of unequal energy collide, the higher-E absorbs the lower-E:
  - Result: `alive(max(E_high - 1, 1))`.
  - The lower-E cell is removed.
  - The result is marked `mergedThisSwipe=true`.

### 3.4 Dormant merges (alive meets dormant)
- If an `alive(Ea)` cell collides with a `dormant(Ed)` cell in the movement path:
  - Result becomes `alive(max(Ea, Ed) - 1)` (minimum 1).
  - Reset `noMergeTicks` to 0.
  - Mark `mergedThisSwipe=true`.
- Dormant vs dormant: they do not merge; the front-most keeps position, the other stacks behind respecting compression order (i.e., dormant tiles are movable but only merge with `alive`).

### 3.5 Colony bonus (optional, tunable)
- Before resolving a merge, determine the size of the 4-connected component of `alive` cells that each participant belongs to in the pre-merge snapshot.
- If both components have size ≥ 4, grant +1 E to the merge result before applying the E_cap.
- Applies once per merge event.

### 3.6 Energy constraints
- Minimum E for any `alive` result is 1.
- Maximum E is E_cap (8 in Early/Mid; 10 in Late). Apply cap after same-E merge, colony bonus, and catalyst doubling.

### 3.7 Deterministic tie-breaking
- Within a line, resolution proceeds from the destination edge outward (front to back). The earlier cell in resolution order collides first.
- When multiple movers would pass through the same intermediate tile, the one earlier in resolution order traverses first and claims any catalyst on that tile (see Section 5).

## 4) Life tick (modified GoL)
- Neighbor counts consider only `alive` cells.
- Survival: `alive` survives with 2 or 3 neighbors; otherwise it becomes `empty`.
- Births: `empty` with exactly 3 neighbors → `alive(1)`.
- Early relaxation (optional): births at 2 or 3 neighbors.
- Dormant cells neither contribute to neighbor counts nor are affected by Life rules directly.

## 5) Catalyst behavior
- Spawned rarely (tunable) on `empty` tiles; at most M catalysts may exist concurrently.
- During a Swipe, track the exact path of each moving `alive` cell along grid tiles from start to end (including end tile). If the path visits a cell containing a catalyst:
  - Immediately double the mover’s E, capped by E_cap.
  - Remove (consume) the catalyst tile.
  - A mover can benefit at most once per swipe even if crossing multiple catalysts.
- Catalysts have no effect outside the Swipe phase.

## 6) Blight behavior and shielding
- Spawn: at configured intervals/probabilities (seeded RNG), new blight tokens appear on `empty` tiles; multiple tokens may exist.
- Effect (Blight step): Each token attempts to convert orthogonally adjacent `alive` cells to `dormant`.
- Shielding: A target adjacent `alive` cell is immune if it is part of a locally stable pattern:
  - Still life: the 3x3 neighborhood centered on the cell is unchanged after one Life tick.
  - Period-2 oscillator: the same neighborhood returns to its original state after two Life ticks.
  - Implementation: simulate Life locally on a 5x5 window for up to 2 ticks with the current difficulty’s birth rule, using only `alive` cells (ignore blight and decay during this check). If the 3x3 center area is identical at t=0 and t=1 (still life) or t=0 and t=2 (period-2), the cell is shielded.
- Persistence: Tokens apply once and then are removed. In Late difficulty, they may linger for L>1 applications (tunable), applying each turn until their charges are consumed.

## 7) Dormancy and isolation decay
- `noMergeTicks` applies only to `alive` cells with E=1.
- Increment rule: increment after a Swipe where the cell did not merge; reset to 0 on any merge or on birth this tick.
- Conversion: when `noMergeTicks` reaches 3, convert to `dormant(1)`.
- Re-energizing dormant: If a dormant merges with any `alive` during a future Swipe, it becomes `alive` again with E per rule 3.4 and `noMergeTicks=0`.
- Isolation decay (Mid/Late): After blight, any `alive` cell with ≤1 alive neighbors loses 1 E (floor 1).

## 8) Scoring, stability, and goals
- Turn score base: S_base = sum of E over all `alive` cells after Life, Dormancy, and Hazards/Decay are resolved.
- Stability condition: During the Life tick of this turn, births == 0 and deaths == 0.
- Streak multiplier: M = min(1 + 0.25*(streak-1), 3.0), where streak is the count of consecutive stable turns including this one; streak resets to 0 on any non-stable Life tick.
- Score addition: S_turn = S_base * M. Total score += S_turn.
- Stabilize goal (win condition variant): Achieve a stable Life tick (no births/deaths) and total E ≥ StabilizeThreshold for one full cycle (Swipe + Tick). Threshold scales with board and difficulty.

## 9) Difficulty parameters (defaults v1)
- Early: { E_cap: 8, birthRelaxation: true (2 or 3), blight: off, decay: off, catalystRate: low, stabilizeThreshold: medium }
- Mid:   { E_cap: 8, birthRelaxation: false, blight: low, decay: on (-1 if ≤1 neighbors), catalystRate: low }
- Late:  { E_cap: 10, birthRelaxation: false, blight: medium (may linger 2), decay: on (-1 or -2 tunable), catalystRate: low–medium }

## 10) Edge cases and tie-breakers
- Triple in-a-line merges: A B A with A=A and B arbitrary → only the leading pair that collides first can merge; the resulting tile cannot merge again this swipe.
- Equal-E double collision: A A A → first pair merges to A+1, third A slides into place but cannot merge with the just-formed A+1 this swipe.
- Unequal absorption floor: absorbing cannot drop below E=1.
- Cap precedence: Apply in this order during a merge resolution: (same-E increment) → (colony bonus) → (catalyst doubling if collision occurs later in path). Cap after each operation.
- Dormant blocking: An `alive` cell moving into a `dormant` uses rule 3.4; if two `alive` cells push into a single dormant sequentially in the same line, only the first to contact can merge this swipe; the later one interacts with the new result per one-merge-per-result.
- Birth into blight: Life births happen before blight; born cells can be converted unless shielded.
- Catalyst contention: If two movers would cross the same catalyst, the earlier in line resolution claims it; the catalyst is then gone for the later mover.

## 11) Worked examples
Notation: `aE` = alive with energy E, `dE` = dormant E, `.` = empty.

### 11.1 Swipe Right — equal merges
Row before: `a2 . a2 a2`
- Movement order (Right): from right edge leftward: collide a2 (col2) with a2 (col3) → merge to a3; leftmost a2 slides behind.
Row after swipe: `. . a2 a3`

### 11.2 Swipe Left — unequal absorption
Row before: `a4 a2 . a1`
- Left swipe: a4 meets a2 → a3 (absorb -1); a1 slides behind but cannot merge with a3.
Row after swipe: `a3 a1 . .`

### 11.3 Dormant merge
Row before (Left): `a3 d5 . .`
- a3 collides with d5 → alive(max(3,5)-1)=a4.
Row after swipe: `a4 . . .`

### 11.4 Life birth and death
3x3 block before Life:
```
a1 a1 a1
.  .  .
.  .  .
```
- Center of top row has 2 neighbors (survives), ends have 1 (die). Cell (1,1) is born (3 neighbors) at E=1 under standard rules.

## 12) Implementation notes
- Swipe engine should operate on immutable snapshots per line and write back deterministically.
- Life tick can be computed by a pass that counts neighbors using a compact int buffer; dormant ignored.
- Blight shielding uses local simulation (5x5 window) and should not mutate global state.
- RNG must be seeded; all spawns (blight/catalyst) derive from a deterministic sequence.

## 13) Open tunables
- Colony bonus threshold and magnitude (+1 vs conditional).
- Blight spawn telegraph and linger charges in Late.
- Decay amount (-1 vs -2 in Late) and whether E=1 decay contributes to dormancy pressure (it does by making merges necessary).

This spec finalizes the mechanics for implementation and testing. Any deviation should be captured as a parameter in configuration and noted here.

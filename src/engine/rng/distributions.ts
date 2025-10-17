export function pickIndex(weights: readonly number[], rng: () => number): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let threshold = rng() * total;
  for (let i = 0; i < weights.length; i += 1) {
    threshold -= weights[i];
    if (threshold <= 0) {
      return i;
    }
  }
  return weights.length - 1;
}

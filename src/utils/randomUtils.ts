export function randomInt(min: number, max: number): number {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin + 1)) + ceilMin;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

export function weightedRandom<T>(items: T[], weights: number[]): T | undefined {
  if (items.length === 0 || weights.length !== items.length) {
    return undefined;
  }

  const totalWeight = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (totalWeight <= 0) {
    return undefined;
  }

  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    const w = Math.max(0, weights[i]);
    random -= w;
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

export function chance(probability: number): boolean {
  const p = Math.max(0, Math.min(1, probability));
  return Math.random() < p;
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

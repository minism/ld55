export function randomIntBetween(low: number, high: number) {
  const range = high - low;
  const r = Math.random() * range;
  return Math.floor(low + r);
}

export function lerp(a: number, b: number, t: number) {
  return a + clamp01(t) * (b - a);
}

export function clamp(val: number, min: number, max: number) {
  return Math.max(Math.min(val, max), min);
}

export function clamp01(val: number) {
  return clamp(val, 0, 1);
}

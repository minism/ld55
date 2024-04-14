export function randomIntBetween(low: number, high: number) {
  const range = high - low;
  const r = Math.random() * range;
  return Math.floor(low + r);
}

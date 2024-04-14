export function isDefined<T>(t: T | null | undefined): t is T {
  return t != null;
}

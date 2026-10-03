/**
 * Limits a number to the range [min, max].
 * Used e.g. to keep item quantities between 1 and 999.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

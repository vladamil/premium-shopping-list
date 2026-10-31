import { describe, expect, it } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
  it('returns the value unchanged when it is inside the range', () => {
    expect(clamp(5, 1, 999)).toBe(5);
  });

  it('raises a value below the range to the minimum', () => {
    expect(clamp(0, 1, 999)).toBe(1);
  });

  it('lowers a value above the range to the maximum', () => {
    expect(clamp(1500, 1, 999)).toBe(999);
  });
});

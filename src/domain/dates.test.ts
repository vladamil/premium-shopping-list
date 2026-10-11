import { describe, expect, it } from 'vitest';
import { formatListDate } from './dates';

/**
 * "Now" in every test. All times are at noon, so the date is the same
 * in every time zone and the tests pass anywhere (also on GitHub's CI).
 */
const NOW = new Date('2026-10-11T12:00:00.000Z');

describe('formatListDate', () => {
  it('says "Created today" for a list created on the same day', () => {
    expect(formatListDate('2026-10-11T12:00:00.000Z', NOW, 'en-US')).toBe(
      'Created today',
    );
  });

  it('shows month and day for an earlier date this year (Oct 2)', () => {
    expect(formatListDate('2026-10-02T12:00:00.000Z', NOW, 'en-US')).toBe(
      'Oct 2',
    );
  });

  it('adds the year for a date in an earlier year (Oct 2, 2025)', () => {
    expect(formatListDate('2025-10-02T12:00:00.000Z', NOW, 'en-US')).toBe(
      'Oct 2, 2025',
    );
  });

  it('does not say "today" for the same day and month in an earlier year', () => {
    expect(formatListDate('2025-10-11T12:00:00.000Z', NOW, 'en-US')).toBe(
      'Oct 11, 2025',
    );
  });
});

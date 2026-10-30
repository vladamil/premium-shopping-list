import { describe, expect, it } from 'vitest';
import { backupFileName } from './backupFile';

// new Date(year, monthIndex, day, hour) uses the LOCAL time zone, like the
// function does, so these tests pass anywhere. Careful: monthIndex 9 = October.

describe('backupFileName', () => {
  it('puts the date in the name (Oct 29, 2026)', () => {
    const date = new Date(2026, 9, 29, 12);

    expect(backupFileName(date)).toBe('cartographer-backup-2026-10-29.json');
  });

  it('adds a zero to a one-digit month and day (Mar 5 → 03-05)', () => {
    const date = new Date(2026, 2, 5, 12);

    expect(backupFileName(date)).toBe('cartographer-backup-2026-03-05.json');
  });
});

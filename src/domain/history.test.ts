import { describe, expect, it } from 'vitest';
import { groupTripsByMonth } from './history';
import type { CompletedList, Item } from './schemas';

/**
 * Builds a valid item. Money is in CENTS: 10_000 = 100.00.
 * Pass only what the test cares about: makeItem({ unitPrice: 25_000 })
 */
let nextId = 1;
function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: `item-${nextId++}`,
    name: 'Test item',
    quantity: 1,
    unitPrice: 10_000,
    isBought: true,
    ...overrides,
  };
}

/**
 * Builds a finished trip. Pass at least `completedAt`.
 * Use NOON times in the middle of a month ('2026-10-15T12:00:00.000Z'), so
 * the month is the same in every time zone and the tests pass anywhere.
 */
function makeTrip(overrides: Partial<CompletedList> = {}): CompletedList {
  return {
    id: `trip-${nextId++}`,
    title: 'Weekly groceries',
    status: 'completed',
    items: [makeItem()],
    budget: null,
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T12:00:00.000Z',
    completedAt: '2026-10-15T12:00:00.000Z',
    ...overrides,
  };
}

describe('groupTripsByMonth', () => {
  it('returns no months when there are no trips', () => {
    expect(groupTripsByMonth([], 'en-US')).toEqual([]);
  });

  it('puts two trips from the same month into one group', () => {
    const first = makeTrip({ completedAt: '2026-10-05T12:00:00.000Z' });
    const second = makeTrip({ completedAt: '2026-10-17T12:00:00.000Z' });

    const months = groupTripsByMonth([first, second], 'en-US');

    expect(months).toHaveLength(1);
    expect(months[0]?.label).toBe('October 2026');
    // Newest first: the Oct 17 trip comes before the Oct 5 trip.
    expect(months[0]?.trips).toEqual([second, first]);
  });

  it('starts a new group when the month changes, newest month first', () => {
    const first = makeTrip({ completedAt: '2026-10-05T12:00:00.000Z' });
    const second = makeTrip({ completedAt: '2026-10-17T12:00:00.000Z' });
    const third = makeTrip({ completedAt: '2026-11-17T12:00:00.000Z' });

    const months = groupTripsByMonth([first, second, third], 'en-US');

    expect(months).toHaveLength(2);
    expect(months[0]?.label).toBe('November 2026');
    expect(months[1]?.label).toBe('October 2026');
    expect(months[0]?.trips).toEqual([third]);
    expect(months[1]?.trips).toEqual([second, first]);
  });

  it('sorts the trips itself, whatever order they come in', () => {
    const first = makeTrip({ completedAt: '2026-10-25T12:00:00.000Z' });
    const second = makeTrip({ completedAt: '2026-10-17T12:00:00.000Z' });
    const third = makeTrip({ completedAt: '2026-10-19T12:00:00.000Z' });

    const months = groupTripsByMonth([first, second, third], 'en-US');

    expect(months[0]?.trips).toEqual([first, third, second]);
  });

  it('keeps the same month of different years apart (November 2025 vs November 2026)', () => {
    const first = makeTrip({ completedAt: '2026-11-05T12:00:00.000Z' });
    const second = makeTrip({ completedAt: '2026-11-17T12:00:00.000Z' });
    const third = makeTrip({ completedAt: '2025-11-13T12:00:00.000Z' });

    const months = groupTripsByMonth([first, second, third], 'en-US');

    expect(months).toHaveLength(2);
    expect(months[0]?.label).toBe('November 2026');
    expect(months[1]?.label).toBe('November 2025');
  });

  it('adds up what was spent in each month, counting bought items only', () => {
    const item1 = makeItem({ isBought: true, unitPrice: 500 });
    const item2 = makeItem({ isBought: true, unitPrice: 1500 });
    const item3 = makeItem({ isBought: false, unitPrice: 500 });
    const trip1 = makeTrip({
      completedAt: '2026-10-05T12:00:00.000Z',
      items: [item1, item2, item3],
    });
    const trip2 = makeTrip({
      completedAt: '2026-10-17T12:00:00.000Z',
      items: [item2, item3],
    });

    const months = groupTripsByMonth([trip1, trip2], 'en-US');

    expect(months).toHaveLength(1);
    expect(months[0]?.spent).toBe(3500);
  });

  it('does not change the order of the array it was given', () => {
    const first = makeTrip({ completedAt: '2026-10-25T12:00:00.000Z' });
    const second = makeTrip({ completedAt: '2026-10-17T12:00:00.000Z' });
    const third = makeTrip({ completedAt: '2026-10-19T12:00:00.000Z' });

    const initialArray = [first, second, third];

    groupTripsByMonth(initialArray, 'en-US');

    expect(initialArray).toEqual([first, second, third]);
  });
});

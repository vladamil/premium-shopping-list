import { describe, expect, it } from 'vitest';
import {
  budgetStatus,
  inCartTotal,
  itemTotal,
  plannedTotal,
  progress,
  unpricedCount,
} from './calculations';
import type { Item } from './schemas';

/**
 * Builds a fresh, valid item for each test. Pass only the fields
 * the test cares about: makeItem({ quantity: 3, unitPrice: 18900 })
 */
let nextId = 1;
function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: `item-${nextId++}`,
    name: 'Test item',
    quantity: 1,
    unitPrice: 10_000,
    isBought: false,
    ...overrides,
  };
}

describe('itemTotal', () => {
  it('multiplies quantity by unit price', () => {
    const item = makeItem({ quantity: 3, unitPrice: 18_900 });

    expect(itemTotal(item)).toBe(56_700);
  });

  it('returns null when the price is unknown', () => {
    const item = makeItem({ unitPrice: null });

    expect(itemTotal(item)).toBe(null);
  });

  // Your turn: replace each `it.todo` with a real test.
  it('returns 0 for a free item (price 0)', () => {
    const item = makeItem({ unitPrice: 0 });

    expect(itemTotal(item)).toBe(0);
  });
});

describe('plannedTotal', () => {
  it('skips items with an unknown price', () => {
    const items = [
      makeItem({ unitPrice: 10_000 }),
      makeItem({ unitPrice: null }),
      makeItem({ quantity: 2, unitPrice: 5_000 }),
    ];

    expect(plannedTotal(items)).toBe(20_000);
  });

  it('returns 0 for no items', () => {
    const items: Item[] = [];

    expect(plannedTotal(items)).toBe(0);
  });

  it('includes both bought and unbought items', () => {
    const items = [
      makeItem({ unitPrice: 10_000, isBought: true }),
      makeItem({ unitPrice: 3_000, isBought: false }),
      makeItem({ quantity: 2, unitPrice: 5_000, isBought: true }),
    ];

    expect(plannedTotal(items)).toBe(23_000);
  });
});

describe('inCartTotal', () => {
  it('adds up only the bought items', () => {
    const items = [
      makeItem({ unitPrice: 10_000, isBought: true }),
      makeItem({ unitPrice: 3_000, isBought: false }),
      makeItem({ quantity: 2, unitPrice: 5_000, isBought: true }),
    ];

    expect(inCartTotal(items)).toBe(20_000);
  });

  it('returns 0 when nothing is bought yet', () => {
    const items = [
      makeItem({ unitPrice: 10_000, isBought: false }),
      makeItem({ unitPrice: 3_000, isBought: false }),
      makeItem({ quantity: 2, unitPrice: 5_000, isBought: false }),
    ];

    expect(inCartTotal(items)).toBe(0);
  });
});

describe('unpricedCount', () => {
  it('counts items types (not their quantity) with an unknown price', () => {
    const items = [
      makeItem({ unitPrice: null }),
      makeItem({ unitPrice: 3_000 }),
      makeItem({ quantity: 2, unitPrice: null }),
    ];

    expect(unpricedCount(items)).toBe(2);
  });

  it('does not count a free item (price 0) as unpriced', () => {
    const items = [
      makeItem({ unitPrice: null }),
      makeItem({ unitPrice: 0 }),
      makeItem({ unitPrice: 100 }),
      makeItem({ quantity: 2, unitPrice: null }),
    ];

    expect(unpricedCount(items)).toBe(2);
  });
});

describe('progress', () => {
  it('counts bought items (types) out of all items', () => {
    const items = [
      makeItem({ unitPrice: null, isBought: true }),
      makeItem({ unitPrice: 3_000, isBought: false }),
      makeItem({ quantity: 2, unitPrice: null, isBought: true }),
    ];

    expect(progress(items)).toStrictEqual({ bought: 2, total: 3 });
  });
});

describe('budgetStatus', () => {
  it('returns "none" when there is no budget', () => {
    const items = [
      makeItem({ unitPrice: 500 }),
      makeItem({ unitPrice: 3_000 }),
      makeItem({ quantity: 2, unitPrice: null }),
    ];

    expect(budgetStatus(items, null)).toBe('none');
  });

  it('returns "ok" when the planned total is below 90% of the budget', () => {
    const items = [
      makeItem({ unitPrice: 3_999 }),
      makeItem({ unitPrice: 3_000 }),
      makeItem({ quantity: 2, unitPrice: 1_000 }),
    ];

    expect(budgetStatus(items, 10_000)).toBe('ok');
  });

  it('returns "near" at exactly 90% of the budget', () => {
    const items = [
      makeItem({ unitPrice: 4_000 }),
      makeItem({ unitPrice: 3_000 }),
      makeItem({ quantity: 2, unitPrice: 1_000 }),
    ];

    expect(budgetStatus(items, 10_000)).toBe('near');
  });

  it('returns "near" when the planned total equals the budget', () => {
    const items = [
      makeItem({ unitPrice: 500 }),
      makeItem({ unitPrice: 3_000 }),
      makeItem({ quantity: 2, unitPrice: 1_000 }),
    ];

    expect(budgetStatus(items, 5_500)).toBe('near');
  });

  it('returns "over" when the planned total is 1 cent above the budget', () => {
    const items = [
      makeItem({ unitPrice: 501 }),
      makeItem({ unitPrice: 3_000 }),
      makeItem({ quantity: 2, unitPrice: 1_000 }),
    ];

    expect(budgetStatus(items, 5_500)).toBe('over');
  });
});

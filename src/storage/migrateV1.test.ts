import { describe, expect, it } from 'vitest';
import { migrateV1 } from './migrateV1';

/**
 * Builds one list the way v1 saved it. Change only what a test needs:
 * makeV1List({ isCompleted: true })
 */
function makeV1List(overrides: Record<string, unknown> = {}) {
  return {
    id: 'list-1',
    title: 'Weekly',
    items: [
      { id: 'item-1', name: 'Milk', quantity: 2, price: 159.5, isBought: true },
    ],
    createdAt: '2026-07-17T10:00:00.000Z',
    isCompleted: false,
    completedAt: null,
    ...overrides,
  };
}

/** Turns v1 lists into the text v1 stored in localStorage. */
function toV1Text(lists: unknown[]) {
  return JSON.stringify(lists);
}

describe('migrateV1', () => {
  it('converts an active v1 list to the v2 shape', () => {
    const result = migrateV1(toV1Text([makeV1List()]));

    expect(result.data.lists).toEqual([
      {
        id: 'list-1',
        title: 'Weekly',
        items: [
          {
            id: 'item-1',
            name: 'Milk',
            quantity: 2,
            unitPrice: 15_950,
            isBought: true,
          },
        ],
        budget: null,
        status: 'active',
        createdAt: '2026-07-17T10:00:00.000Z',
        updatedAt: '2026-07-17T10:00:00.000Z',
      },
    ]);
    expect(result.skippedLists).toBe(0);
  });

  it('turns a price of 0 into "no price" (null)', () => {
    const v1List = makeV1List({
      items: [
        {
          id: 'item-1',
          name: 'Milk',
          quantity: 2,
          price: 0,
          isBought: true,
        },
      ],
    });

    const result = migrateV1(toV1Text([v1List]));

    expect(result.data.lists[0]?.items[0]?.unitPrice).toBe(null);
    expect(result.skippedLists).toBe(0);
  });

  it('turns a completed list into status "completed" with its completedAt', () => {
    const v1List = makeV1List({
      isCompleted: true,
      completedAt: '2026-07-20T18:00:00.000Z',
    });

    const result = migrateV1(toV1Text([v1List]));

    expect(result.data.lists[0]?.status).toBe('completed');
    expect(result.data.lists[0]).haveOwnProperty(
      'completedAt',
      '2026-07-20T18:00:00.000Z',
    );
    expect(result.skippedLists).toBe(0);
  });

  it('uses createdAt when a completed list has no completedAt', () => {
    const v1List = makeV1List({
      isCompleted: true,
    });

    const result = migrateV1(toV1Text([v1List]));

    expect(result.data.lists[0]?.status).toBe('completed');
    expect(result.data.lists[0]).haveOwnProperty('completedAt');
    expect(result.skippedLists).toBe(0);
  });

  it('keeps quantity between 1 and 999', () => {
    const v1List = makeV1List({
      items: [
        {
          id: 'item-1',
          name: 'Milk',
          quantity: 1600,
          price: 0,
          isBought: true,
        },
        {
          id: 'item-2',
          name: 'Yogurt',
          quantity: -4,
          price: 0,
          isBought: true,
        },
      ],
    });

    const result = migrateV1(toV1Text([v1List]));

    expect(result.data.lists[0]?.items[0]?.quantity).toBe(999);
    expect(result.data.lists[0]?.items[1]?.quantity).toBe(1);
    expect(result.skippedLists).toBe(0);
  });

  it('skips a list with no items and counts it', () => {
    const v1List = makeV1List({
      items: [],
    });

    const result = migrateV1(toV1Text([v1List]));

    expect(result.data.lists).toHaveLength(0);
    expect(result.skippedLists).toBe(1);
  });

  it('returns empty data when the text is not JSON', () => {
    const result = migrateV1('not json }');

    expect(result.data.lists).toStrictEqual([]);
    expect(result.data.schemaVersion).toBe(2);
    expect(result.hadProblems).toBe(true);
  });
});

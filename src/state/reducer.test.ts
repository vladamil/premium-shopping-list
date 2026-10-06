import { describe, expect, it } from 'vitest';
import { createEmptyAppData } from '../storage/parseAppData';
import type { AppData, ShoppingList } from '../domain/schemas';
import { createList } from './actions';
import { appReducer } from './reducer';

/** A fixed date, so test results never depend on the clock. */
const NOW = '2026-10-06T12:00:00.000Z';

/** Builds a fresh, valid active list. Pass only what the test cares about. */
let nextId = 1;
function makeList(overrides: Partial<ShoppingList> = {}): ShoppingList {
  return {
    id: `list-${nextId++}`,
    title: 'Weekly groceries',
    items: [
      {
        id: `item-${nextId++}`,
        name: 'Milk',
        quantity: 1,
        unitPrice: 15_900,
        isBought: false,
      },
    ],
    budget: null,
    status: 'active',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  } as ShoppingList;
}

/** App data containing the given lists. */
function makeState(lists: ShoppingList[]): AppData {
  return { ...createEmptyAppData(), lists };
}

describe('createList', () => {
  it('adds the new list on top', () => {
    const oldList = makeList();
    const newList = makeList({ title: 'Sunday BBQ' });
    const state = makeState([oldList]);

    const result = appReducer(state, {
      type: 'createList',
      payload: { list: newList },
    });

    expect(result.lists).toEqual([newList, oldList]);
  });

  it('the createList helper builds an active list with unticked items', () => {
    const action = createList(
      'Pharmacy run',
      [{ name: 'Vitamin C', quantity: 1, unitPrice: null }],
      null,
    );

    const result = appReducer(makeState([]), action);

    expect(result.lists[0]?.status).toBe('active');
    expect(result.lists[0]?.items[0]?.isBought).toBe(false);
  });
});

describe('updateList', () => {
  it('renames the list and sets updatedAt to the time of the change', () => {
    const list = makeList();
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'updateList',
      payload: { listId: list.id, changes: { title: 'Big shop' }, now: NOW },
    });

    expect(result.lists[0]?.title).toBe('Big shop');
    expect(result.lists[0]?.updatedAt).toBe(NOW);
  });

  it('sets a budget', () => {
    const list = makeList();
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'updateList',
      payload: { listId: list.id, changes: { budget: 7000 }, now: NOW },
    });

    expect(result.lists[0]?.budget).toBe(7000);
    expect(result.lists[0]?.updatedAt).toBe(NOW);
  });

  it('removes the budget (null)', () => {
    const list = makeList({ budget: 3500 });
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'updateList',
      payload: { listId: list.id, changes: { budget: null }, now: NOW },
    });

    expect(result.lists[0]?.budget).toBe(null);
    expect(result.lists[0]?.updatedAt).toBe(NOW);
  });

  it('leaves the other lists unchanged', () => {
    const changedList = makeList();
    const sameList = makeList();

    const state = makeState([changedList, sameList]);

    const result = appReducer(state, {
      type: 'updateList',
      payload: {
        listId: changedList.id,
        changes: { title: 'Big shop' },
        now: NOW,
      },
    });

    expect(result.lists[0]?.title).toBe('Big shop');
    expect(result.lists[1]).toEqual(sameList);
    expect(result.lists[0]?.updatedAt).toBe(NOW);
  });
});

describe('deleteList', () => {
  it('removes the list', () => {
    const list = makeList();
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'deleteList',
      payload: { listId: list.id },
    });

    expect(result.lists).toEqual([]);
  });

  it('leaves the other lists unchanged', () => {
    const list1 = makeList();
    const list2 = makeList({ title: 'Remaining' });

    const state = makeState([list1, list2]);

    const result = appReducer(state, {
      type: 'deleteList',
      payload: { listId: list1.id },
    });

    expect(result.lists).toHaveLength(1);
    expect(result.lists[0]?.title).toBe('Remaining');
  });
});

describe('never changes the old data', () => {
  it('returns new data and leaves the old data exactly as it was', () => {
    const list = makeList();
    const state = makeState([list]);
    const before = structuredClone(state); // a full copy, for comparing afterwards

    appReducer(state, { type: 'deleteList', payload: { listId: list.id } });

    expect(state).toEqual(before);
  });
});

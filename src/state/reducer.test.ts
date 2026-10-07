import { describe, expect, it } from 'vitest';
import { createEmptyAppData } from '../storage/parseAppData';
import type { AppData, Item, ShoppingList } from '../domain/schemas';
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

/** Builds a fresh, valid item. Pass only what the test cares about. */
function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: `item-${nextId++}`,
    name: 'Bread',
    quantity: 1,
    unitPrice: 22_000,
    isBought: false,
    ...overrides,
  };
}

// -----LISTS TESTS-----
// ---------------------

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

// ----- ITEMS TESTS -----
// -----------------------

describe('addItem', () => {
  it('adds the new item on top of the list', () => {
    const milk = makeItem({ name: 'Milk' });
    const list = makeList({ items: [milk] });
    const state = makeState([list]);
    const eggs = makeItem({ name: 'Eggs' });

    const result = appReducer(state, {
      type: 'addItem',
      payload: { listId: list.id, item: eggs, now: NOW },
    });

    expect(result.lists[0]?.items).toEqual([eggs, milk]);
  });

  // Your turn:
  it('sets the list updatedAt to the time of the change', () => {
    const milk = makeItem({ name: 'Milk' });
    const eggs = makeItem({ name: 'Eggs' });
    const list = makeList({ items: [milk, eggs] });
    const state = makeState([list]);
    const beer = makeItem({ name: 'Beer' });

    const result = appReducer(state, {
      type: 'addItem',
      payload: { listId: list.id, item: beer, now: NOW },
    });

    expect(result.lists[0]?.items).toEqual([beer, milk, eggs]);
    expect(result.lists[0]?.updatedAt).toEqual(NOW);
  });
});

describe('updateItem', () => {
  it('changes the item name', () => {
    const milk = makeItem({ name: 'Milk' });
    const eggs = makeItem({ name: 'Eggs' });
    const list = makeList({ items: [milk, eggs] });
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'updateItem',
      payload: {
        listId: list.id,
        itemId: milk.id,
        changes: { name: 'choco-milk' },
        now: NOW,
      },
    });

    expect(result.lists[0]?.items[0]?.name).toEqual('choco-milk');
    expect(result.lists[0]?.updatedAt).toEqual(NOW);
  });

  it('changes quantity and price', () => {
    const milk = makeItem({ name: 'Milk' });
    const eggs = makeItem({ name: 'Eggs' });
    const list = makeList({ items: [milk, eggs] });
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'updateItem',
      payload: {
        listId: list.id,
        itemId: milk.id,
        changes: { quantity: 10, unitPrice: 14_000 },
        now: NOW,
      },
    });

    expect(result.lists[0]?.items[0]?.quantity).toEqual(10);
    expect(result.lists[0]?.items[0]?.unitPrice).toEqual(14_000);
    expect(result.lists[0]?.updatedAt).toEqual(NOW);
  });

  it('leaves the other item unchanged', () => {
    const milk = makeItem({ name: 'Milk' });
    const eggs = makeItem({ name: 'Eggs' });
    const list = makeList({ items: [milk, eggs] });
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'updateItem',
      payload: {
        listId: list.id,
        itemId: milk.id,
        changes: { quantity: 10, unitPrice: 14_000 },
        now: NOW,
      },
    });

    expect(result.lists[0]?.items[1]).toEqual(eggs);
    expect(result.lists[0]?.updatedAt).toEqual(NOW);
  });
});

describe('removeItem', () => {
  it('does nothing when it is the last item (a list can never be empty)', () => {
    const milk = makeItem({ name: 'Milk' });
    const list = makeList({ items: [milk] });
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'removeItem',
      payload: { listId: list.id, itemId: milk.id, now: NOW },
    });

    expect(result.lists[0]).toEqual(list);
  });

  it('removes the item when the list has more than one', () => {
    const milk = makeItem({ name: 'Milk' });
    const eggs = makeItem({ name: 'Eggs' });
    const list = makeList({ items: [milk, eggs] });
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'removeItem',
      payload: { listId: list.id, itemId: milk.id, now: NOW },
    });

    expect(result.lists[0]?.items).toHaveLength(1);
    expect(result.lists[0]?.items[0]?.name).toEqual('Eggs');
    expect(result.lists[0]?.updatedAt).toEqual(NOW);
  });
});

describe('toggleItem', () => {
  it('ticks an unticked item', () => {
    const milk = makeItem({ name: 'Milk', isBought: false });
    const list = makeList({ items: [milk] });
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'toggleItem',
      payload: { listId: list.id, itemId: milk.id, now: NOW },
    });

    expect(result.lists[0]?.items[0]?.isBought).toBe(true);
  });

  it('unticks a ticked item', () => {
    const milk = makeItem({ name: 'Milk', isBought: true });
    const list = makeList({ items: [milk] });
    const state = makeState([list]);

    const result = appReducer(state, {
      type: 'toggleItem',
      payload: { listId: list.id, itemId: milk.id, now: NOW },
    });

    expect(result.lists[0]?.items[0]?.isBought).toBe(false);
  });
});

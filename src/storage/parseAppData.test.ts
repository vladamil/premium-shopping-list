import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  type AppData,
  type ShoppingList,
} from '../domain/schemas';
import { createEmptyAppData, parseAppData } from './parseAppData';

/** Builds a fresh, valid list. Pass only what the test cares about. */
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
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-05T10:00:00.000Z',
    ...overrides,
  } as ShoppingList;
}

/** Builds valid saved data containing the given lists. */
function makeAppData(lists: ShoppingList[]): AppData {
  return { ...createEmptyAppData(), lists };
}

describe('parseAppData', () => {
  it('returns valid saved data unchanged', () => {
    const saved = makeAppData([makeList(), makeList()]);

    const result = parseAppData(JSON.stringify(saved));

    expect(result.data).toEqual(saved);
    expect(result.skippedLists).toBe(0);
    expect(result.hadProblems).toBe(false);
  });

  it('starts with empty data when the text is not JSON', () => {
    const result = parseAppData('this is not JSON {');

    expect(result.data).toEqual(createEmptyAppData());
    expect(result.hadProblems).toBe(true);
  });

  it('keeps the valid lists, skips the broken ones and counts them', () => {
    const saved = makeAppData([makeList(), makeList({ title: '' })]);

    const result = parseAppData(JSON.stringify(saved));

    expect(result.skippedLists).toBe(1);
    expect(result.data.lists).toHaveLength(1);
    expect(result.hadProblems).toBe(true);
  });

  it('falls back to default settings when the settings are broken', () => {
    const saved = {
      ...makeAppData([makeList()]),
      settings: { currency: 'GBP', theme: 'dark', keepScreenAwake: true },
    };

    const result = parseAppData(JSON.stringify(saved));

    expect(result.data.settings).toEqual(DEFAULT_SETTINGS);
    expect(result.hadProblems).toBe(true);
  });

  it('keeps all lists when only the settings are broken', () => {
    const saved = {
      ...makeAppData([makeList(), makeList()]),
      settings: { currency: 'GBP', theme: 'dark', keepScreenAwake: true },
    };

    const result = parseAppData(JSON.stringify(saved));

    expect(result.data.lists).toEqual(saved.lists);
    expect(result.skippedLists).toEqual(0);
    expect(result.hadProblems).toBe(true);
  });

  it('treats JSON that is not an object (e.g. "42") as empty data', () => {
    const result = parseAppData('42');

    expect(result.data).toEqual(createEmptyAppData());
    expect(result.hadProblems).toBe(true);
  });

  it('treats a missing "lists" field as no lists', () => {
    const saved = { schemaVersion: 2, settings: DEFAULT_SETTINGS }; // no "lists" at all;

    const result = parseAppData(JSON.stringify(saved));

    expect(result.data.lists).toStrictEqual([]);
    expect(result.hadProblems).toBe(true);
  });
});

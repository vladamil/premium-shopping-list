import { describe, expect, it } from 'vitest';
import type { AppData } from '../domain/schemas';
import { V1_STORAGE_KEY } from './migrateV1';
import { createEmptyAppData } from './parseAppData';
import {
  BROKEN_COPY_KEY,
  loadAppData,
  saveAppData,
  STORAGE_KEY,
  type KeyValueStorage,
} from './storage';

/**
 * A pretend localStorage that lives in memory, so tests don't need a browser.
 * Pass starting values like: createFakeStorage({ 'cartographer:data': '...' })
 */
function createFakeStorage(
  startingValues: Record<string, string> = {},
): KeyValueStorage {
  const values = new Map(Object.entries(startingValues));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

/** A storage that fails on every call, like a blocked or full localStorage. */
const blockedStorage: KeyValueStorage = {
  getItem: () => {
    throw new Error('Storage is blocked');
  },
  setItem: () => {
    throw new Error('Storage is full');
  },
};

describe('loadAppData', () => {
  it('returns empty data on first launch (nothing saved yet)', () => {
    const storage = createFakeStorage();

    const result = loadAppData(storage);

    expect(result.data).toEqual(createEmptyAppData());
    expect(result.skippedLists).toBe(0);
  });

  it('loads the data that saveAppData saved', () => {
    const storage = createFakeStorage();
    const data: AppData = {
      ...createEmptyAppData(),
      settings: { currency: 'EUR', theme: 'dark', keepScreenAwake: false },
    };

    saveAppData(data, storage);
    const result = loadAppData(storage);

    expect(result.data).toEqual(data);
  });

  it('keeps a safety copy of the original text when the data is broken', () => {
    const brokenText = 'this is not JSON {';
    const storage = createFakeStorage({ [STORAGE_KEY]: brokenText });

    loadAppData(storage);

    expect(storage.getItem(BROKEN_COPY_KEY)).toBe(brokenText);
  });

  it('does not keep a safety copy when the data is fine', () => {
    const storage = createFakeStorage();
    saveAppData(createEmptyAppData(), storage);

    loadAppData(storage);

    expect(storage.getItem(BROKEN_COPY_KEY)).toBe(null);
  });
  it('returns empty data when the storage cannot be read', () => {
    const result = loadAppData(blockedStorage);

    expect(result.data).toEqual(createEmptyAppData());
  });

  it('converts v1 data and saves it as v2 when there is no v2 data yet', () => {
    const v1Lists = [
      {
        id: 'list-1',
        title: 'Weekly',
        items: [
          { id: 'i-1', name: 'Milk', quantity: 1, price: 159, isBought: false },
        ],
        createdAt: '2026-07-17T10:00:00.000Z',
        isCompleted: false,
        completedAt: null,
      },
    ];
    const storage = createFakeStorage({
      [V1_STORAGE_KEY]: JSON.stringify(v1Lists),
    });

    const result = loadAppData(storage);

    expect(result.data.lists).toHaveLength(1);
    expect(storage.getItem(STORAGE_KEY)).not.toBe(null);
  });
});

describe('saveAppData', () => {
  it('returns true when saving works', () => {
    const storage = createFakeStorage();

    expect(saveAppData(createEmptyAppData(), storage)).toBe(true);
  });

  it('returns false instead of crashing when the storage is full', () => {
    expect(saveAppData(createEmptyAppData(), blockedStorage)).toBe(false);
  });
});

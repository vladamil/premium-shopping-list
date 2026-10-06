import type { AppData } from '../domain/schemas';
import { migrateV1, V1_STORAGE_KEY } from './migrateV1';
import { createEmptyAppData, parseAppData } from './parseAppData';

export const STORAGE_KEY = 'cartographer:data';
export const BROKEN_COPY_KEY = 'cartographer:data:broken';

/** The two localStorage methods we use. Tests pass a fake with the same shape. */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type LoadResult = {
  data: AppData;
  /** How many saved lists were broken and left out (for an on-screen message). */
  skippedLists: number;
};

/** Reads the saved data. Never throws: if anything goes wrong, the app still starts. */
export function loadAppData(storage?: KeyValueStorage): LoadResult {
  try {
    const store = storage ?? localStorage;
    const text = store.getItem(STORAGE_KEY);

    if (text === null) {
      // No v2 data yet. Did the user have v1? Then convert it once and save it as v2.
      const v1Text = store.getItem(V1_STORAGE_KEY);
      if (v1Text !== null) {
        const migrated = migrateV1(v1Text);
        saveAppData(migrated.data, store);
        return { data: migrated.data, skippedLists: migrated.skippedLists };
      }

      // First launch: nothing saved at all.
      return { data: createEmptyAppData(), skippedLists: 0 };
    }

    const result = parseAppData(text);

    // Keep the original text before the app saves the cleaned-up data over it.
    if (result.hadProblems) {
      store.setItem(BROKEN_COPY_KEY, text);
    }

    return { data: result.data, skippedLists: result.skippedLists };
  } catch {
    // Storage can't be read (e.g. disabled by the browser).
    return { data: createEmptyAppData(), skippedLists: 0 };
  }
}

/** Saves the data. Returns false instead of crashing if saving fails (storage full or disabled). */
export function saveAppData(data: AppData, storage?: KeyValueStorage): boolean {
  try {
    const store = storage ?? localStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

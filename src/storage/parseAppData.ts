import {
  appDataSchema,
  DEFAULT_SETTINGS,
  settingsSchema,
  shoppingListSchema,
  type AppData,
  type ShoppingList,
} from '../domain/schemas';

export type ParseResult = {
  data: AppData;
  /** How many lists were broken and had to be left out. */
  skippedLists: number;
  /** true when anything was wrong, so the caller can keep a safety copy. */
  hadProblems: boolean;
};

/** Fresh data for a first launch (a new object every time, never shared). */
export function createEmptyAppData(): AppData {
  return { schemaVersion: 2, settings: { ...DEFAULT_SETTINGS }, lists: [] };
}

/** Narrows `unknown` to "some object whose fields we can look at". */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Turns the saved text into valid app data. Never throws:
 * whatever is wrong with the text, the app still gets usable data.
 */
export function parseAppData(text: string): ParseResult {
  // Step 1: is the text JSON at all?
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { data: createEmptyAppData(), skippedLists: 0, hadProblems: true };
  }

  // Step 2: the normal case — everything is valid.
  const result = appDataSchema.safeParse(json);
  if (result.success) {
    return { data: result.data, skippedLists: 0, hadProblems: false };
  }

  // Step 3: something is wrong — rescue whatever is still valid.
  const saved = isObject(json) ? json : {};

  const settingsResult = settingsSchema.safeParse(saved.settings);
  const settings = settingsResult.success
    ? settingsResult.data
    : { ...DEFAULT_SETTINGS };

  const savedLists = Array.isArray(saved.lists) ? saved.lists : [];
  const lists: ShoppingList[] = [];
  let skippedLists = 0;

  for (const savedList of savedLists) {
    const listResult = shoppingListSchema.safeParse(savedList);
    if (listResult.success) {
      lists.push(listResult.data);
    } else {
      skippedLists++;
    }
  }

  return {
    data: { schemaVersion: 2, settings, lists },
    skippedLists,
    hadProblems: true,
  };
}

import { z } from 'zod';
import {
  LIMITS,
  shoppingListSchema,
  type ShoppingList,
} from '../domain/schemas';
import { clamp } from '../lib/clamp';
import { createEmptyAppData, type ParseResult } from './parseAppData';

export const V1_STORAGE_KEY = 'grocery_lists';

/** How v1 saved one item (prices were decimals, 0 meant "no price"). */
const v1ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
  isBought: z.boolean(),
});

/** How v1 saved one list. */
const v1ListSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(v1ItemSchema),
  createdAt: z.string(),
  isCompleted: z.boolean(),
  completedAt: z.string().nullable(),
});

type V1List = z.infer<typeof v1ListSchema>;

/** Builds a v2 list from a v1 list. The result is checked afterwards. */
function convertList(old: V1List) {
  const items = old.items.map((item) => ({
    id: item.id,
    name: item.name.trim().slice(0, LIMITS.itemNameMaxLength),
    quantity: clamp(Math.round(item.quantity), 1, LIMITS.quantityMax),
    // v1 saved 0 when the price field was left empty → "no price".
    unitPrice: item.price > 0 ? Math.round(item.price * 100) : null,
    isBought: item.isBought,
  }));

  const common = {
    id: old.id,
    title: old.title.trim().slice(0, LIMITS.titleMaxLength),
    items,
    budget: null,
    createdAt: old.createdAt,
  };

  if (old.isCompleted) {
    const completedAt = old.completedAt ?? old.createdAt;
    return {
      ...common,
      status: 'completed',
      completedAt,
      updatedAt: completedAt,
    };
  }
  return { ...common, status: 'active', updatedAt: old.createdAt };
}

/**
 * Turns v1's saved text into v2 data. Never throws.
 * Lists that can't be converted are skipped and counted.
 */
export function migrateV1(text: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { data: createEmptyAppData(), skippedLists: 0, hadProblems: true };
  }

  const oldLists = Array.isArray(json) ? json : [];
  const lists: ShoppingList[] = [];
  let skippedLists = 0;

  for (const oldList of oldLists) {
    // a. Is it a v1 list at all?
    const oldResult = v1ListSchema.safeParse(oldList);
    if (!oldResult.success) {
      skippedLists++;
      continue;
    }

    // b + c. Convert it, then check it with the normal v2 rules.
    const newResult = shoppingListSchema.safeParse(convertList(oldResult.data));
    if (newResult.success) {
      lists.push(newResult.data);
    } else {
      skippedLists++;
    }
  }

  return {
    data: { ...createEmptyAppData(), lists },
    skippedLists,
    hadProblems: skippedLists > 0,
  };
}

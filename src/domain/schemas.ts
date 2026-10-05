import { z } from 'zod';

// ---------------------------------------------------------------------------
// Limits — the single source of truth for every rule in the app.
// ---------------------------------------------------------------------------

export const LIMITS = {
  titleMaxLength: 40,
  itemNameMaxLength: 60,
  quantityMin: 1,
  quantityMax: 999,
  /** 1,000,000.00 expressed in minor units (cents/para). */
  moneyMax: 100_000_000,
} as const;

export const CURRENCIES = ['RSD', 'EUR', 'USD'] as const;
export const THEMES = ['system', 'light', 'dark'] as const;

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

/**
 * Money is stored as a whole number of minor units (cents/para),
 * e.g. 120.50 → 12050. Whole numbers add up exactly; decimals don't.
 */
export const moneySchema = z
  .number()
  .int('Amount must be a whole number of cents')
  .nonnegative('Amount cannot be negative')
  .max(
    LIMITS.moneyMax,
    `Amount cannot be more than ${(LIMITS.moneyMax / 100).toLocaleString('en-US')}`,
  );

/** Trims the ends and collapses repeated inner spaces: "  a   b " → "a b". */
const cleanText = (text: string) => text.trim().replace(/\s+/g, ' ');

const idSchema = z.string().min(1);
const isoDateSchema = z.iso.datetime();

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export const itemSchema = z.object({
  id: idSchema,
  name: z
    .string()
    .overwrite(cleanText)
    .min(1, 'Item name is required')
    .max(
      LIMITS.itemNameMaxLength,
      `Item name can be at most ${LIMITS.itemNameMaxLength} characters`,
    ),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(LIMITS.quantityMin, `Quantity must be at least ${LIMITS.quantityMin}`)
    .max(LIMITS.quantityMax, `Quantity can be at most ${LIMITS.quantityMax}`),
  /** null = price not known yet (different from 0 = free). */
  unitPrice: moneySchema.nullable(),
  isBought: z.boolean(),
});

/** Fields shared by active and completed lists. */
const listFields = {
  id: idSchema,
  title: z
    .string()
    .overwrite(cleanText)
    .min(1, 'List name is required')
    .max(
      LIMITS.titleMaxLength,
      `List name can be at most ${LIMITS.titleMaxLength} characters`,
    ),
  items: z.array(itemSchema).min(1, 'A list needs at least one item'),
  /** null = no budget set. A budget of 0 makes no sense, so it must be positive. */
  budget: moneySchema.positive('Budget must be more than 0').nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
};

const activeListSchema = z.object({
  ...listFields,
  status: z.literal('active'),
});

const completedListSchema = z.object({
  ...listFields,
  status: z.literal('completed'),
  completedAt: isoDateSchema,
});

/**
 * A list is EITHER active OR completed. Only completed lists have a
 * completedAt date — Zod (and TypeScript) enforce that, so the two can
 * never contradict each other like v1's isCompleted + completedAt did.
 */
export const shoppingListSchema = z.discriminatedUnion('status', [
  activeListSchema,
  completedListSchema,
]);

export const settingsSchema = z.object({
  currency: z.enum(CURRENCIES),
  theme: z.enum(THEMES),
  keepScreenAwake: z.boolean(),
});

/** Everything the app saves, in one versioned envelope. */
export const appDataSchema = z.object({
  schemaVersion: z.literal(2),
  settings: settingsSchema,
  lists: z.array(shoppingListSchema),
});

// ---------------------------------------------------------------------------
// TypeScript types — generated from the schemas, so they can never disagree.
// ---------------------------------------------------------------------------

export type Money = z.infer<typeof moneySchema>;
export type Item = z.infer<typeof itemSchema>;
export type ShoppingList = z.infer<typeof shoppingListSchema>;
export type ListStatus = ShoppingList['status'];
export type Settings = z.infer<typeof settingsSchema>;
export type Currency = Settings['currency'];
export type Theme = Settings['theme'];
export type AppData = z.infer<typeof appDataSchema>;

export const DEFAULT_SETTINGS: Settings = {
  currency: 'RSD',
  theme: 'system',
  keepScreenAwake: true,
};

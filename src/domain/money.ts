import { z } from 'zod';
import { moneySchema, type Currency, type Money } from './schemas';

/** Digits, optionally followed by "." or "," and 1–2 decimals: 120 · 120.5 · 120,50 */
const MONEY_TEXT_PATTERN = /^\d+([.,]\d{1,2})?$/;

/**
 * Converts money text (already checked by MONEY_TEXT_PATTERN) to minor units
 * using whole numbers only. Multiplying decimals is unsafe in JavaScript:
 * 19.99 * 100 === 1998.9999999999998.
 */
function toMinorUnits(text: string): Money {
  const [whole = '0', fraction = ''] = text.split(/[.,]/);
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

/**
 * Validates what the user typed in a price or budget field.
 * "" → null (no price) · "120,50" → 12050 · "-5", "abc", "12.345" → error
 */
export const moneyInputSchema = z
  .string()
  .trim()
  .refine(
    (text) => text === '' || MONEY_TEXT_PATTERN.test(text),
    'Enter an amount like 120 or 120.50',
  )
  .transform((text) => (text === '' ? null : toMinorUnits(text)))
  .pipe(moneySchema.nullable());

export function parseMoney(text: string) {
  return moneyInputSchema.safeParse(text);
}

/**
 * Formats minor units for display, always with 2 decimals:
 * 12050 + 'RSD' → "RSD 120.50" (en-US) or "120,50 RSD" (sr-RS).
 * `locale` is optional: without it, the browser's language is used.
 */
export function formatMoney(
  amount: Money,
  currency: Currency,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    // Intl shows RSD without decimals by default and would round 120.50 → 121.
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

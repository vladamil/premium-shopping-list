import type { Item, Money } from './schemas';

/**
 * Everything in this file is CALCULATED from items and never stored,
 * so a total can never disagree with the items it was calculated from.
 *
 * The functions take items (not a whole list) so they also work on the
 * New list screen, before the list exists.
 */

export type BudgetStatus = 'none' | 'ok' | 'near' | 'over';

/** From this share of the budget, the planned total counts as "near". */
export const BUDGET_NEAR_RATIO = 0.9;

/** quantity × unit price, or null when the price is unknown. */
export function itemTotal(item: Item): Money | null {
  if (item.unitPrice === null) {
    return null;
  }
  return item.quantity * item.unitPrice;
}

/** Total of everything on the list. Items with an unknown price count as 0. */
export function plannedTotal(items: Item[]): Money {
  return items.reduce((sum, item) => sum + (itemTotal(item) ?? 0), 0);
}

/** Total of only the ticked-off items (in the cart / actually spent). */
export function inCartTotal(items: Item[]): Money {
  const boughtItems = items.filter((item) => item.isBought);
  return plannedTotal(boughtItems);
}

/** How many items have no price yet (a price of 0 IS a price). */
export function unpricedCount(items: Item[]): number {
  return items.filter((item) => item.unitPrice === null).length;
}

export function progress(items: Item[]): { bought: number; total: number } {
  return {
    bought: items.filter((item) => item.isBought).length,
    total: items.length,
  };
}

/** Compares the planned total with the (optional) budget. */
export function budgetStatus(
  items: Item[],
  budget: Money | null,
): BudgetStatus {
  if (budget === null) {
    return 'none';
  }

  const planned = plannedTotal(items);

  if (planned > budget) {
    return 'over';
  }
  if (planned >= budget * BUDGET_NEAR_RATIO) {
    return 'near';
  }
  return 'ok';
}

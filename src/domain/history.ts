import { inCartTotal } from './calculations';
import type { CompletedList, Money } from './schemas';

/** One month on the History page: "September 2026 · 4 trips · RSD 18,455.00". */
export type TripMonth = {
  /** "September 2026" */
  label: string;
  /** This month's trips, newest first. */
  trips: CompletedList[];
  /** Money spent on all of this month's trips together (bought items only). */
  spent: Money;
};

/**
 * Puts finished trips into month groups, newest month first.
 * The trips are sorted here, so the order they come in doesn't matter.
 * `locale` is optional: without it, the browser's language is used.
 */
export function groupTripsByMonth(
  trips: CompletedList[],
  locale?: string,
): TripMonth[] {
  // Newest first. toSorted() gives back a NEW sorted array (the saved order
  // stays as it is). ISO dates ("2026-09-27T…") sort correctly as plain text.
  const newestFirst = trips.toSorted((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );

  const months: TripMonth[] = [];

  for (const trip of newestFirst) {
    const label = new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(new Date(trip.completedAt));

    // The group we added last (undefined while the array is still empty).
    const lastMonth = months.at(-1);

    if (lastMonth !== undefined && lastMonth.label === label) {
      // Same month as the previous trip → add it to that group.
      lastMonth.trips.push(trip);
      lastMonth.spent = lastMonth.spent + inCartTotal(trip.items);
    } else {
      // A new month → start a new group with just this trip.
      months.push({ label, trips: [trip], spent: inCartTotal(trip.items) });
    }
  }

  return months;
}

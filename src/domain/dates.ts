/**
 * When a list was created, as shown on its card:
 * today → "Created today" · this year → "Oct 2" · an earlier year → "Oct 2, 2025".
 *
 * `now` is passed in (instead of reading the clock here) so tests can use a fixed date.
 * `locale` is optional: without it, the browser's language is used.
 */
export function formatListDate(
  isoDate: string,
  now: Date,
  locale?: string,
): string {
  const date = new Date(isoDate);

  const isSameYear = date.getFullYear() === now.getFullYear();
  const isToday =
    isSameYear &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return 'Created today';
  }

  if (isSameYear) {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * The day of a shopping trip, with the weekday: "Sat, Oct 3".
 * Used when finishing a trip (and later in History).
 * `locale` is optional: without it, the browser's language is used.
 */
export function formatTripDate(isoDate: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoDate));
}

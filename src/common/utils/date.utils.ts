/**
 * Helpers for the `YYYY-MM-DD` date strings used by every `type: 'date'`
 * column in the project. All math is done in UTC so results do not shift
 * with the server's time zone.
 */

export const MS_PER_DAY = 86_400_000;

/** Normalizes a Date or an ISO/date string to `YYYY-MM-DD`. */
export function toIsoDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

/** Today's date as `YYYY-MM-DD` (UTC). */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Parses `YYYY-MM-DD` as midnight UTC. */
export function parseIsoDate(iso: string): Date {
  return new Date(`${toIsoDate(iso)}T00:00:00Z`);
}

/** Returns `iso` shifted by `days` (negative values go backwards). */
export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

/** Whole days from `fromIso` to `toIso`; negative when `toIso` is earlier. */
export function daysBetween(
  fromIso: Date | string,
  toIso: Date | string,
): number {
  const from = parseIsoDate(toIsoDate(fromIso)).getTime();
  const to = parseIsoDate(toIsoDate(toIso)).getTime();
  return Math.round((to - from) / MS_PER_DAY);
}

/** Clamps a date range to a window; returns the overlap in days (>= 0). */
export function overlapDays(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): number {
  const start = startA > startB ? startA : startB;
  const end = endA < endB ? endA : endB;
  if (end < start) {
    return 0;
  }
  // Both ends inclusive: a diet active on a single day counts as 1 day.
  return daysBetween(start, end) + 1;
}

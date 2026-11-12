export const MS_PER_DAY = 86_400_000;

export function toIsoDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function parseIsoDate(iso: string): Date {
  return new Date(`${toIsoDate(iso)}T00:00:00Z`);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function daysBetween(
  fromIso: Date | string,
  toIso: Date | string,
): number {
  const from = parseIsoDate(toIsoDate(fromIso)).getTime();
  const to = parseIsoDate(toIsoDate(toIso)).getTime();
  return Math.round((to - from) / MS_PER_DAY);
}

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
  return daysBetween(start, end) + 1;
}

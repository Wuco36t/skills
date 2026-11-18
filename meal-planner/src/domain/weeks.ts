const DAY_MS = 86_400_000

function parse(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function format(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Monday of the week containing `date` (YYYY-MM-DD), using UTC arithmetic. */
export function weekStart(date: string): string {
  const ms = parse(date)
  const dow = new Date(ms).getUTCDay() // 0 = Sunday
  const offset = (dow + 6) % 7 // days since Monday
  return format(ms - offset * DAY_MS)
}

/** The 7 consecutive dates beginning at `start`. */
export function weekDays(start: string): string[] {
  const ms = parse(start)
  return Array.from({ length: 7 }, (_, i) => format(ms + i * DAY_MS))
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

export function fmtShort(s: string): string {
  const d = toDate(s);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function fmtLong(s: string): string {
  const d = toDate(s);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function addDays(s: string, n: number): string {
  const d = toDate(s);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86400000);
}

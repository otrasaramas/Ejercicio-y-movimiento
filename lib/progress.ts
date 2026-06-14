import { AppData } from "./types";
import { addDays, todayStr } from "./dates";

// Días completados ordenados
export function completedDates(data: AppData): string[] {
  return Object.values(data.logs)
    .filter((l) => l.completed)
    .map((l) => l.date)
    .sort();
}

// Racha actual: días consecutivos terminando hoy o ayer
export function currentStreak(data: AppData): number {
  const done = new Set(completedDates(data));
  let streak = 0;
  let cursor = todayStr();
  // Si hoy aún no está hecho, empezamos desde ayer para no romper la racha.
  if (!done.has(cursor)) cursor = addDays(cursor, -1);
  while (done.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// Racha más larga histórica
export function longestStreak(data: AppData): number {
  const dates = completedDates(data);
  if (dates.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (addDays(dates[i - 1], 1) === dates[i]) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function totalCompleted(data: AppData): number {
  return completedDates(data).length;
}

// Semanas completas (7 días seguidos sin faltar dentro de la racha más larga)
export function fullWeeks(data: AppData): number {
  return Math.floor(longestStreak(data) / 7);
}

// ---------- Medallas ----------
export interface Medal {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  earned: (data: AppData) => boolean;
}

export const medals: Medal[] = [
  {
    id: "first-day",
    name: "Primer paso",
    desc: "Completa tu primer día",
    emoji: "🌱",
    earned: (d) => totalCompleted(d) >= 1,
  },
  {
    id: "streak-3",
    name: "En marcha",
    desc: "3 días seguidos",
    emoji: "✨",
    earned: (d) => longestStreak(d) >= 3,
  },
  {
    id: "week-1",
    name: "Semana perfecta",
    desc: "7 días sin faltar",
    emoji: "🏅",
    earned: (d) => longestStreak(d) >= 7,
  },
  {
    id: "streak-14",
    name: "Imparable",
    desc: "14 días seguidos",
    emoji: "🔥",
    earned: (d) => longestStreak(d) >= 14,
  },
  {
    id: "cycle-done",
    name: "Ciclo cerrado",
    desc: "Termina un ciclo de prueba",
    emoji: "🎯",
    earned: (d) => d.cycleHistory.length >= 1,
  },
  {
    id: "total-21",
    name: "Constancia",
    desc: "21 días completados en total",
    emoji: "💎",
    earned: (d) => totalCompleted(d) >= 21,
  },
  {
    id: "weigh-in",
    name: "Auto-conocimiento",
    desc: "Registra peso 4 veces",
    emoji: "⚖️",
    earned: (d) => d.weights.length >= 4,
  },
  {
    id: "measured",
    name: "Progreso medido",
    desc: "2 mediciones con metro",
    emoji: "📏",
    earned: (d) => d.measurements.length >= 2,
  },
];

export function newlyEarned(data: AppData): Medal[] {
  return medals.filter((m) => m.earned(data) && !data.earnedMedals.includes(m.id));
}

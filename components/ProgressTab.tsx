"use client";

import { useStore } from "@/lib/store";
import {
  currentStreak,
  longestStreak,
  totalCompleted,
  fullWeeks,
  medals,
} from "@/lib/progress";
import { addDays, todayStr } from "@/lib/dates";
import { demoData } from "@/lib/demo";

export default function ProgressTab() {
  const { data, setData, reset } = useStore();

  const stats = [
    { label: "Racha actual", value: currentStreak(data), suffix: "días", emoji: "🔥" },
    { label: "Mejor racha", value: longestStreak(data), suffix: "días", emoji: "⭐" },
    { label: "Días totales", value: totalCompleted(data), suffix: "", emoji: "✅" },
    { label: "Semanas full", value: fullWeeks(data), suffix: "", emoji: "🏅" },
  ];

  // Heatmap de las últimas 5 semanas (35 días)
  const today = todayStr();
  const days: { date: string; done: boolean; energy?: number }[] = [];
  for (let i = 34; i >= 0; i--) {
    const date = addDays(today, -i);
    const log = data.logs[date];
    days.push({ date, done: !!log?.completed, energy: log?.energy });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-coffee/50">
          Resultados
        </p>
        <h1 className="font-serif text-4xl text-espresso">Tu constancia</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl2 bg-white/60 p-4 text-center shadow-sm"
          >
            <div className="text-2xl">{s.emoji}</div>
            <div className="font-serif text-4xl text-espresso">{s.value}</div>
            <div className="font-sans text-xs text-coffee/50">
              {s.label} {s.suffix && `(${s.suffix})`}
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap de constancia */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">Últimas 5 semanas</h2>
        <p className="font-sans text-xs text-coffee/50">
          Cada cuadrito es un día. Verde = entrenaste.
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
            <div
              key={i}
              className="text-center font-sans text-[10px] text-coffee/40"
            >
              {d}
            </div>
          ))}
          {days.map((d) => (
            <div
              key={d.date}
              title={d.date}
              className={`aspect-square rounded-md ${
                d.done
                  ? "bg-sageDeep"
                  : d.energy !== undefined
                  ? "bg-clay/30"
                  : "bg-sand"
              }`}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 font-sans text-[11px] text-coffee/50">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-sageDeep" /> Completado
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-clay/30" /> Registrado
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-sand" /> Vacío
          </span>
        </div>
      </section>

      {/* Medallas */}
      <section>
        <h2 className="mb-3 font-serif text-2xl text-espresso">Medallas</h2>
        <div className="grid grid-cols-2 gap-3">
          {medals.map((m) => {
            const earned = m.earned(data);
            return (
              <div
                key={m.id}
                className={`rounded-xl2 p-4 text-center transition ${
                  earned
                    ? "animate-pop bg-gold/20 shadow-sm"
                    : "bg-sand/60 opacity-60"
                }`}
              >
                <div
                  className={`text-4xl ${earned ? "" : "grayscale"}`}
                >
                  {earned ? m.emoji : "🔒"}
                </div>
                <div className="mt-1 font-serif text-lg leading-tight text-espresso">
                  {m.name}
                </div>
                <div className="font-sans text-[11px] text-coffee/50">
                  {m.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ajustes / datos */}
      <section className="rounded-xl2 bg-sand/50 p-4">
        <p className="font-sans text-xs uppercase tracking-wider text-coffee/50">
          Datos
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setData(() => demoData())}
            className="flex-1 rounded-2xl bg-white/70 py-2.5 font-sans text-sm text-coffee"
          >
            Cargar ejemplo
          </button>
          <button
            onClick={() => {
              if (confirm("¿Borrar todos tus datos? Esto no se puede deshacer."))
                reset();
            }}
            className="flex-1 rounded-2xl bg-white/70 py-2.5 font-sans text-sm text-clay"
          >
            Borrar todo
          </button>
        </div>
        <p className="mt-2 font-sans text-[11px] text-coffee/40">
          Tus datos se guardan solo en este dispositivo (localStorage).
        </p>
      </section>
    </div>
  );
}

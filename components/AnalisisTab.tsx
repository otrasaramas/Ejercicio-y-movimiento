"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { addDays, todayStr } from "@/lib/dates";
import { profileForEnergy } from "@/lib/routine";
import LineChart from "./LineChart";

export default function AnalisisTab() {
  const { data } = useStore();
  const [range, setRange] = useState<7 | 30>(7);

  const today = todayStr();
  const dates = useMemo(() => {
    const arr: string[] = [];
    for (let i = range - 1; i >= 0; i--) arr.push(addDays(today, -i));
    return arr;
  }, [range, today]);

  const logs = dates.map((d) => data.logs[d]).filter(Boolean);

  const energyPoints = dates
    .filter((d) => data.logs[d])
    .map((d) => ({ date: d, value: data.logs[d].energy }));

  const moodPoints = dates
    .filter((d) => data.logs[d]?.moodAfter !== undefined)
    .map((d) => ({ date: d, value: data.logs[d].moodAfter as number }));

  const avg = (arr: number[]) =>
    arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;

  const avgEnergy = avg(logs.map((l) => l.energy));
  const avgMood = avg(
    logs.filter((l) => l.moodAfter !== undefined).map((l) => l.moodAfter!)
  );
  const trained = logs.filter((l) => l.completed).length;
  const avgIntensity = Math.round(
    avg(logs.map((l) => profileForEnergy(l.energy).intensity)) * 100
  );

  // ---- Progreso de ejercicios de fuerza ----
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    Object.values(data.logs).forEach((l) =>
      (l.strength ?? []).forEach((s) => s.name && names.add(s.name))
    );
    return Array.from(names);
  }, [data.logs]);

  const [selected, setSelected] = useState<string>("");
  const exName = selected || exerciseNames[0] || "";

  const loadPoints = useMemo(() => {
    const pts: { date: string; value: number }[] = [];
    Object.keys(data.logs)
      .sort()
      .forEach((d) => {
        const entry = (data.logs[d].strength ?? []).find(
          (s) => s.name === exName && typeof s.load === "number"
        );
        if (entry) pts.push({ date: d, value: entry.load as number });
      });
    return pts;
  }, [data.logs, exName]);

  const stats = [
    { label: "Días entrenados", value: `${trained}`, emoji: "✅" },
    { label: "Energía media", value: `${avgEnergy}/5`, emoji: "🔋" },
    { label: "Intensidad media", value: `${avgIntensity}%`, emoji: "⚡" },
    { label: "Ánimo después", value: avgMood ? `${avgMood}/5` : "—", emoji: "💛" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-coffee/50">
            Insights
          </p>
          <h1 className="font-serif text-4xl text-espresso">Análisis</h1>
        </div>
        <div className="flex rounded-full bg-sand p-1">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition ${
                range === r ? "bg-coffee text-cream" : "text-coffee/50"
              }`}
            >
              {r === 7 ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl2 bg-white/60 p-4 text-center shadow-sm"
          >
            <div className="text-xl">{s.emoji}</div>
            <div className="font-serif text-3xl text-espresso">{s.value}</div>
            <div className="font-sans text-xs text-coffee/50">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Energía por día */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">Energía por día</h2>
        <p className="font-sans text-xs text-coffee/50">
          Tu nivel de energía (0–5) en {range === 7 ? "la semana" : "el mes"}.
        </p>
        <div className="mt-3">
          <LineChart points={energyPoints} color="#7E9072" unit="" />
        </div>
      </section>

      {/* Ánimo después */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">
          Cómo me sentí después
        </h2>
        <p className="font-sans text-xs text-coffee/50">
          Tu ánimo al terminar (1–5). Útil para ver qué rutina te deja mejor.
        </p>
        <div className="mt-3">
          <LineChart points={moodPoints} color="#E2A75A" unit="" />
        </div>
      </section>

      {/* Progreso de fuerza */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">
          Progreso de ejercicios
        </h2>
        {exerciseNames.length === 0 ? (
          <p className="mt-1 font-sans text-sm text-coffee/40">
            Registra ejercicios de fuerza con carga (kg/banda) en «Hoy» y aquí
            verás cómo van progresando.
          </p>
        ) : (
          <>
            <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {exerciseNames.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelected(n)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 font-sans text-xs transition ${
                    exName === n
                      ? "bg-coffee text-cream"
                      : "bg-cream text-coffee/60 hover:bg-sand"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-2 font-sans text-xs text-coffee/50">
              Carga registrada de «{exName}» en el tiempo.
            </p>
            <div className="mt-2">
              <LineChart points={loadPoints} color="#C08475" unit="" />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

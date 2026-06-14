"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { addDays, todayStr, fmtLong } from "@/lib/dates";
import { profileForEnergy, energyProfiles } from "@/lib/routine";
import { DayLog } from "@/lib/types";
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

  // Distribución de energía (cuántos días en cada nivel)
  const distribution = [5, 4, 3, 2, 1, 0].map((lvl) => ({
    lvl,
    count: logs.filter((l) => l.energy === lvl).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

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
    { label: "Días entrenados", value: `${trained}`, bg: "bg-grass" },
    { label: "Energía media", value: `${avgEnergy}/5`, bg: "bg-lemon" },
    { label: "Intensidad media", value: `${avgIntensity}%`, bg: "bg-pink" },
    { label: "Ánimo después", value: avgMood ? `${avgMood}/5` : "—", bg: "bg-sky" },
  ];

  // Días con registro (para el timeline), más reciente primero
  const timeline = dates.filter((d) => data.logs[d]).reverse();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-coffee/50">
            Insights
          </p>
          <h1 className="font-serif text-4xl text-espresso">Análisis</h1>
        </div>
        <div className="flex rounded-full bg-coffee p-1">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-4 py-1.5 font-sans text-xs font-bold transition ${
                range === r ? "bg-gold text-espresso" : "text-cream/70"
              }`}
            >
              {r === 7 ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </header>

      {/* Stats coloridos */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl2 ${s.bg} p-4 text-espresso shadow-sm`}
          >
            <div className="font-serif text-4xl font-bold leading-none">
              {s.value}
            </div>
            <div className="mt-1 font-sans text-xs font-medium opacity-70">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Barras de energía por día */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">Energía por día</h2>
        <p className="font-sans text-xs text-coffee/50">
          Altura y color según tu energía (0–5).
        </p>
        <EnergyBars dates={dates} logs={data.logs} />
      </section>

      {/* Distribución de energía */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">
          Distribución de energía
        </h2>
        <div className="mt-3 space-y-2">
          {distribution.map((d) => {
            const p = energyProfiles[d.lvl];
            return (
              <div key={d.lvl} className="flex items-center gap-3">
                <span className="w-6 text-center text-lg">{p.emoji}</span>
                <span className="w-6 font-sans text-xs font-bold text-coffee/60">
                  {d.lvl}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(d.count / maxCount) * 100}%`,
                      backgroundColor: p.color,
                      minWidth: d.count > 0 ? "1.5rem" : 0,
                    }}
                  />
                </div>
                <span className="w-6 text-right font-sans text-xs font-bold text-coffee/60">
                  {d.count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ánimo después */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">
          Cómo me sentí después
        </h2>
        <div className="mt-3">
          <LineChart points={moodPoints} color="#E84A2F" unit="" />
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
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 font-sans text-xs font-medium transition ${
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
              <LineChart points={loadPoints} color="#2F55F0" unit="" />
            </div>
          </>
        )}
      </section>

      {/* Timeline: tu camino día por día */}
      <section>
        <h2 className="mb-3 font-serif text-2xl text-espresso">Tu camino</h2>
        {timeline.length === 0 ? (
          <p className="font-sans text-sm text-coffee/40">
            Aún no hay registros en este período.
          </p>
        ) : (
          <div className="space-y-2">
            {timeline.map((d) => (
              <DayCard key={d} log={data.logs[d]} routine={data.routine} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Barras verticales de energía por día
function EnergyBars({
  dates,
  logs,
}: {
  dates: string[];
  logs: Record<string, DayLog>;
}) {
  return (
    <div className="mt-3 flex h-28 items-end gap-1">
      {dates.map((d) => {
        const log = logs[d];
        const lvl = log?.energy;
        const p = lvl !== undefined ? energyProfiles[lvl] : undefined;
        const h = lvl !== undefined ? 12 + (lvl / 5) * 88 : 4;
        return (
          <div
            key={d}
            className="flex-1 rounded-t-md transition-all"
            style={{
              height: `${h}%`,
              backgroundColor: p ? p.color : "#EADFC2",
            }}
            title={`${d} · energía ${lvl ?? "—"}`}
          />
        );
      })}
    </div>
  );
}

// Tarjeta expandible con el detalle de un día
function DayCard({
  log,
  routine,
}: {
  log: DayLog;
  routine: { parts: { key: string; exercises: { id: string; name: string; unit?: string }[] }[] };
}) {
  const [open, setOpen] = useState(false);
  const p = energyProfiles[log.energy];
  const gymEx = routine.parts.find((x) => x.key === "gimnasio")?.exercises ?? [];
  const exName = (id: string) => gymEx.find((e) => e.id === id)?.name ?? id;

  const gymDone = log.exercises.filter((e) => e.done).length;
  const strengthN = log.strength?.length ?? 0;
  const yogaN = log.yoga?.length ?? 0;

  const chips: { label: string; cls: string }[] = [];
  if (gymDone > 0) chips.push({ label: `Gym ${gymDone}`, cls: "bg-sky/30" });
  if (strengthN > 0)
    chips.push({ label: `Fuerza ${strengthN}`, cls: "bg-grass/30" });
  if (yogaN > 0) chips.push({ label: `Yoga ${yogaN}`, cls: "bg-pink/40" });

  const intensity = Math.round(profileForEnergy(log.energy).intensity * 100);

  return (
    <div className="overflow-hidden rounded-xl2 bg-white/60 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: p.color }}
        >
          {p.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg capitalize text-espresso">
            {fmtLong(log.date)}
          </p>
          <div className="mt-0.5 flex flex-wrap gap-1">
            <span className="rounded-full bg-cream px-2 py-0.5 font-sans text-[10px] font-semibold text-coffee/60">
              ⚡ {intensity}%
            </span>
            {log.moodAfter && (
              <span className="rounded-full bg-cream px-2 py-0.5 font-sans text-[10px]">
                {["😣", "😕", "😌", "🙂", "😄"][log.moodAfter - 1]}
              </span>
            )}
            {log.isPeriod && (
              <span className="rounded-full bg-pink/40 px-2 py-0.5 font-sans text-[10px]">
                🤍 periodo
              </span>
            )}
            {chips.map((c) => (
              <span
                key={c.label}
                className={`rounded-full ${c.cls} px-2 py-0.5 font-sans text-[10px] font-semibold text-coffee/70`}
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
        <span className="text-coffee/30">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="space-y-2 px-4 pb-4 font-sans text-sm">
          {gymDone > 0 && (
            <DetailBlock title="Gimnasio">
              {log.exercises
                .filter((e) => e.done)
                .map((e) => (
                  <li key={e.exerciseId} className="flex justify-between">
                    <span>{exName(e.exerciseId)}</span>
                    <span className="text-coffee/50">
                      {e.realValue !== undefined && `${e.realValue}min`}
                      {e.level !== undefined && ` · nivel ${e.level}`}
                    </span>
                  </li>
                ))}
            </DetailBlock>
          )}
          {strengthN > 0 && (
            <DetailBlock title="Fuerza">
              {log.strength!.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span>{s.name || "—"}</span>
                  <span className="text-coffee/50">
                    {s.series ?? "?"}×{s.reps ?? "?"}
                    {s.load !== undefined &&
                      ` · ${s.load}${s.loadUnit === "banda" ? " banda" : "kg"}`}
                  </span>
                </li>
              ))}
            </DetailBlock>
          )}
          {yogaN > 0 && (
            <DetailBlock title="Yoga">
              {log.yoga!.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span>{s.name || "—"}</span>
                  <span className="text-coffee/50">
                    {s.series ?? "?"}×{s.reps ?? "?"}
                  </span>
                </li>
              ))}
            </DetailBlock>
          )}
          {log.notes && (
            <p className="rounded-2xl bg-cream px-3 py-2 italic text-coffee/70">
              “{log.notes}”
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-cream px-3 py-2">
      <p className="mb-1 font-sans text-[10px] uppercase tracking-wider text-coffee/40">
        {title}
      </p>
      <ul className="space-y-0.5 text-coffee">{children}</ul>
    </div>
  );
}

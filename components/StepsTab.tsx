"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { todayStr, fmtShort, addDays } from "@/lib/dates";
import LineChart from "./LineChart";

export default function StepsTab() {
  const { data, addStep, setStepsGoal, setData } = useStore();
  const today = todayStr();
  const [date, setDate] = useState(today);
  const [count, setCount] = useState("");

  const steps = data.steps;
  const goal = data.stepsGoal || 8000;

  const byDate = useMemo(() => {
    const m: Record<string, number> = {};
    steps.forEach((s) => (m[s.date] = s.count));
    return m;
  }, [steps]);

  const todaySteps = byDate[today] ?? 0;
  const pct = Math.min(100, Math.round((todaySteps / goal) * 100));

  // Promedio y total de los últimos 7 días
  const last7 = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(today, -i);
      if (byDate[d] !== undefined) arr.push(byDate[d]);
    }
    return arr;
  }, [byDate, today]);
  const avg7 = last7.length
    ? Math.round(last7.reduce((a, b) => a + b, 0) / last7.length)
    : 0;
  const daysHitGoal = steps.filter((s) => s.count >= goal).length;

  const save = () => {
    const val = parseInt(count, 10);
    if (!isNaN(val) && val >= 0) {
      addStep({ date, count: val });
      setCount("");
    }
  };

  const remove = (d: string) => {
    setData((p) => ({ ...p, steps: p.steps.filter((s) => s.date !== d) }));
  };

  const fmt = (n: number) => n.toLocaleString("es-ES");

  return (
    <div className="space-y-6">
      <header>
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-cream/60">
          Movimiento diario
        </p>
        <h1 className="font-serif text-4xl text-cream">Pasos</h1>
      </header>

      {/* Anillo de progreso de hoy */}
      <section className="rounded-xl2 bg-panel p-5 shadow-sm">
        <div className="flex items-center gap-5">
          <Ring pct={pct} />
          <div className="flex-1">
            <p className="font-sans text-xs uppercase tracking-wider text-coffee/50">
              Hoy
            </p>
            <p className="font-serif text-4xl font-bold text-espresso">
              {fmt(todaySteps)}
            </p>
            <p className="font-sans text-sm text-coffee/60">
              de {fmt(goal)} pasos
            </p>
            {todaySteps >= goal && (
              <span className="mt-1 inline-block rounded-full bg-sage px-3 py-0.5 font-sans text-xs font-bold text-espresso">
                ✓ ¡Meta lograda!
              </span>
            )}
          </div>
        </div>

        {/* Editar meta */}
        <div className="mt-4 flex items-center gap-2 border-t border-coffee/10 pt-3">
          <span className="font-sans text-sm text-coffee/60">Meta diaria</span>
          <input
            type="number"
            inputMode="numeric"
            value={goal}
            onChange={(e) => setStepsGoal(Number(e.target.value) || 0)}
            className="w-24 rounded-xl border border-coffee/15 bg-cream px-2 py-1 text-center font-sans text-sm text-coffee focus:outline-none"
          />
          <span className="font-sans text-sm text-coffee/40">pasos</span>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Media 7 días", value: fmt(avg7), bg: "bg-sky" },
          { label: "Metas logradas", value: `${daysHitGoal}`, bg: "bg-lemon" },
          { label: "Días con registro", value: `${steps.length}`, bg: "bg-pink" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl2 ${s.bg} p-3 text-center text-espresso shadow-sm`}
          >
            <div className="font-serif text-2xl font-bold leading-tight">
              {s.value}
            </div>
            <div className="font-sans text-[10px] font-medium opacity-70">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Registrar pasos */}
      <section className="rounded-xl2 bg-panel p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">Registrar pasos</h2>
        <div className="mt-3 flex gap-2">
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-2xl border border-coffee/15 bg-cream px-3 py-3 font-sans text-sm text-coffee focus:outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="pasos"
            className="w-28 rounded-2xl border border-coffee/15 bg-cream px-3 py-3 text-center font-sans text-sm text-coffee placeholder:text-coffee/30 focus:outline-none"
          />
          <button
            onClick={save}
            className="rounded-2xl bg-coffee px-5 font-serif text-lg text-cream"
          >
            +
          </button>
        </div>
      </section>

      {/* Gráfica */}
      <section className="rounded-xl2 bg-panel p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">
          Pasos en el tiempo
        </h2>
        <div className="mt-3">
          <LineChart
            points={steps.map((s) => ({ date: s.date, value: s.count }))}
            color="#8AAE6A"
            unit=""
          />
        </div>
      </section>

      {/* Historial */}
      {steps.length > 0 && (
        <section>
          <h2 className="mb-2 font-serif text-2xl text-cream">Historial</h2>
          <div className="space-y-1.5">
            {[...steps].reverse().map((s) => (
              <div
                key={s.date}
                className="flex items-center justify-between rounded-2xl bg-sand px-4 py-2.5"
              >
                <span className="font-sans text-sm text-coffee/60">
                  {fmtShort(s.date)}
                </span>
                <span className="font-serif text-lg text-espresso">
                  {fmt(s.count)}
                  {s.count >= goal && " ✓"}
                </span>
                <button
                  onClick={() => remove(s.date)}
                  className="text-coffee/30 hover:text-clay"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Anillo de progreso SVG
function Ring({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="flex-shrink-0">
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke="#EFE4CB"
        strokeWidth="9"
      />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke="#8AAE6A"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 42 42)"
      />
      <text
        x="42"
        y="47"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill="#241D16"
        fontFamily="var(--font-serif)"
      >
        {pct}%
      </text>
    </svg>
  );
}

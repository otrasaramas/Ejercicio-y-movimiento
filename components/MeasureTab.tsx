"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { todayStr, fmtShort } from "@/lib/dates";
import { MeasurementEntry } from "@/lib/types";
import LineChart from "./LineChart";

const fields: { key: keyof MeasurementEntry; label: string }[] = [
  { key: "cintura", label: "Cintura" },
  { key: "cadera", label: "Cadera" },
  { key: "pecho", label: "Pecho" },
  { key: "brazo", label: "Brazo" },
  { key: "muslo", label: "Muslo" },
  { key: "gluteo", label: "Glúteo" },
];

export default function MeasureTab() {
  const { data, addMeasurement, setData } = useStore();
  const [date, setDate] = useState(todayStr());
  const [vals, setVals] = useState<Record<string, string>>({});

  const list = data.measurements;
  const last = list[list.length - 1];
  const prev = list[list.length - 2];

  // Medida seleccionada para la gráfica
  const [metric, setMetric] = useState<keyof MeasurementEntry>("cintura");
  const chartPoints = list
    .filter((m) => typeof m[metric] === "number")
    .map((m) => ({ date: m.date, value: m[metric] as number }));

  const save = () => {
    const entry: MeasurementEntry = { date };
    let any = false;
    for (const f of fields) {
      const v = parseFloat(vals[f.key]);
      if (!isNaN(v)) {
        (entry[f.key] as number) = v;
        any = true;
      }
    }
    if (any) {
      addMeasurement(entry);
      setVals({});
    }
  };

  const remove = (d: string) => {
    setData((p) => ({
      ...p,
      measurements: p.measurements.filter((m) => m.date !== d),
    }));
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-cream/60">
          Seguimiento mensual
        </p>
        <h1 className="font-serif text-4xl text-cream">Mis medidas</h1>
        <p className="mt-1 font-sans text-sm text-cream/60">
          Mídete con el metro una vez al mes y compara con el anterior.
        </p>
      </header>

      {/* Comparación con el mes pasado */}
      {last && (
        <section className="rounded-xl2 bg-panel p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-espresso">
              {fmtShort(last.date)}
            </h2>
            {prev && (
              <span className="font-sans text-xs text-coffee/50">
                vs {fmtShort(prev.date)}
              </span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {fields.map((f) => {
              const cur = last[f.key] as number | undefined;
              const old = prev?.[f.key] as number | undefined;
              const delta =
                cur !== undefined && old !== undefined
                  ? +(cur - old).toFixed(1)
                  : undefined;
              if (cur === undefined) return null;
              return (
                <div key={f.key} className="rounded-2xl bg-cream px-4 py-3">
                  <p className="font-sans text-xs text-coffee/50">{f.label}</p>
                  <p className="font-serif text-2xl text-espresso">
                    {cur}
                    <span className="text-sm text-coffee/40"> cm</span>
                  </p>
                  {delta !== undefined && delta !== 0 && (
                    <p
                      className={`font-sans text-xs font-semibold ${
                        delta < 0 ? "text-sageDeep" : "text-clay"
                      }`}
                    >
                      {delta < 0 ? "↓" : "↑"} {Math.abs(delta)} cm
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Gráfica de evolución */}
      {chartPoints.length > 0 && (
        <section className="rounded-xl2 bg-panel p-5 shadow-sm">
          <h2 className="font-serif text-2xl text-espresso">Evolución</h2>
          <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {fields.map((f) => (
              <button
                key={f.key}
                onClick={() => setMetric(f.key)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 font-sans text-xs transition ${
                  metric === f.key
                    ? "bg-coffee text-cream"
                    : "bg-cream text-coffee/60 hover:bg-sand"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <LineChart points={chartPoints} color="#7E9072" unit="cm" />
          </div>
        </section>
      )}

      {/* Nueva medición */}
      <section className="rounded-xl2 bg-panel p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">Nueva medición</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-3 w-full rounded-2xl border border-coffee/15 bg-cream px-3 py-3 font-sans text-sm text-coffee focus:outline-none"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {fields.map((f) => (
            <div
              key={f.key}
              className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2"
            >
              <label className="flex-1 font-sans text-sm text-coffee/70">
                {f.label}
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={vals[f.key] ?? ""}
                onChange={(e) =>
                  setVals({ ...vals, [f.key]: e.target.value })
                }
                placeholder="cm"
                className="w-16 rounded-lg border border-coffee/15 bg-white px-2 py-1 text-center font-sans text-sm text-coffee placeholder:text-coffee/30 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <button
          onClick={save}
          className="mt-3 w-full rounded-2xl bg-coffee py-3 font-serif text-lg text-cream"
        >
          Guardar medición
        </button>
      </section>

      {/* Historial */}
      {list.length > 0 && (
        <section>
          <h2 className="mb-2 font-serif text-2xl text-cream">Historial</h2>
          <div className="space-y-1.5">
            {[...list].reverse().map((m) => (
              <div
                key={m.date}
                className="flex items-center justify-between rounded-2xl bg-sand px-4 py-2.5"
              >
                <span className="font-sans text-sm text-coffee/60">
                  {fmtShort(m.date)}
                </span>
                <span className="font-sans text-xs text-coffee/50">
                  {fields
                    .filter((f) => m[f.key] !== undefined)
                    .map((f) => `${f.label[0]}:${m[f.key]}`)
                    .join("  ")}
                </span>
                <button
                  onClick={() => remove(m.date)}
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

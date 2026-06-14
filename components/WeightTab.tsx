"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { todayStr, fmtShort } from "@/lib/dates";
import LineChart from "./LineChart";

export default function WeightTab() {
  const { data, addWeight, setData } = useStore();
  const [kg, setKg] = useState("");
  const [date, setDate] = useState(todayStr());

  const weights = data.weights;
  const first = weights[0];
  const last = weights[weights.length - 1];
  const diff = first && last ? +(last.kg - first.kg).toFixed(1) : 0;

  const save = () => {
    const val = parseFloat(kg);
    if (!isNaN(val) && val > 0) {
      addWeight({ date, kg: val });
      setKg("");
    }
  };

  const remove = (d: string) => {
    setData((prev) => ({
      ...prev,
      weights: prev.weights.filter((w) => w.date !== d),
    }));
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-coffee/50">
          Seguimiento
        </p>
        <h1 className="font-serif text-4xl text-espresso">Mi peso</h1>
      </header>

      {/* Resumen */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-coffee/50">
              Actual
            </p>
            <p className="font-serif text-5xl text-espresso">
              {last ? last.kg : "—"}
              <span className="text-2xl text-coffee/40"> kg</span>
            </p>
          </div>
          {weights.length > 1 && (
            <span
              className={`rounded-full px-3 py-1 font-sans text-sm font-semibold ${
                diff <= 0
                  ? "bg-sage/40 text-sageDeep"
                  : "bg-clay/15 text-clay"
              }`}
            >
              {diff > 0 ? "↑" : "↓"} {Math.abs(diff)} kg
            </span>
          )}
        </div>
        <div className="mt-4">
          <LineChart
            points={weights.map((w) => ({ date: w.date, value: w.kg }))}
            color="#C97B4A"
            unit="kg"
          />
        </div>
      </section>

      {/* Registro */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">Registrar peso</h2>
        <div className="mt-3 flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-2xl border border-coffee/15 bg-cream px-3 py-3 font-sans text-sm text-coffee focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="kg"
            className="w-24 rounded-2xl border border-coffee/15 bg-cream px-3 py-3 text-center font-sans text-sm text-coffee placeholder:text-coffee/30 focus:outline-none"
          />
          <button
            onClick={save}
            className="rounded-2xl bg-coffee px-5 font-serif text-lg text-cream"
          >
            +
          </button>
        </div>
      </section>

      {/* Historial */}
      {weights.length > 0 && (
        <section>
          <h2 className="mb-2 font-serif text-2xl text-espresso">Historial</h2>
          <div className="space-y-1.5">
            {[...weights].reverse().map((w) => (
              <div
                key={w.date}
                className="flex items-center justify-between rounded-2xl bg-sand px-4 py-2.5"
              >
                <span className="font-sans text-sm text-coffee/60">
                  {fmtShort(w.date)}
                </span>
                <span className="font-serif text-lg text-espresso">
                  {w.kg} kg
                </span>
                <button
                  onClick={() => remove(w.date)}
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

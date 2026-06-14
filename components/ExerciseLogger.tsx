"use client";

import { StrengthEntry } from "@/lib/types";

// Tarjeta para registrar ejercicios (Fuerza o Yoga): nombre, series, reps y
// opcionalmente carga (kg o banda). Muestra sugerencias para añadir rápido.
export default function ExerciseLogger({
  index,
  title,
  place,
  badge,
  suggestions,
  showLoad,
  emptyHint,
  entries,
  onAdd,
  onUpdate,
  onRemove,
}: {
  index: number;
  title: string;
  place: string;
  badge?: string;
  suggestions: string[];
  showLoad: boolean;
  emptyHint: string;
  entries: StrengthEntry[];
  onAdd: (name?: string) => void;
  onUpdate: (id: string, patch: Partial<StrengthEntry>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl2 bg-white/60 shadow-sm">
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-wider text-coffee/50">
            Parte {index + 1} · {place}
          </p>
          <h3 className="font-serif text-2xl text-espresso">{title}</h3>
        </div>
        {badge && (
          <span className="rounded-full bg-sage/40 px-3 py-1 font-sans text-xs font-semibold text-espresso">
            {badge}
          </span>
        )}
      </div>

      {/* Sugerencias para añadir rápido */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onAdd(s)}
              className="rounded-full border border-coffee/15 bg-cream px-3 py-1 font-sans text-xs text-coffee/70 hover:border-coffee/40 hover:text-coffee"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 px-3 pb-3 pt-3">
        {entries.length === 0 && (
          <p className="px-2 font-sans text-sm text-coffee/40">{emptyHint}</p>
        )}

        {entries.map((s, i) => (
          <div key={s.id} className="rounded-2xl bg-cream px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-semibold text-coffee/40">
                {i + 1}
              </span>
              <input
                value={s.name}
                onChange={(e) => onUpdate(s.id, { name: e.target.value })}
                placeholder="Nombre del ejercicio"
                className="flex-1 bg-transparent font-sans text-sm text-coffee placeholder:text-coffee/30 focus:outline-none"
              />
              <button
                onClick={() => onRemove(s.id)}
                className="text-coffee/30 hover:text-clay"
                aria-label="Eliminar"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 flex items-stretch gap-2 pl-5">
              <NumField
                label="Series"
                value={s.series}
                onChange={(v) => onUpdate(s.id, { series: v })}
              />
              <NumField
                label="Reps"
                value={s.reps}
                onChange={(v) => onUpdate(s.id, { reps: v })}
              />
              {showLoad && (
                <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-white/70 px-2 py-1.5">
                  <button
                    onClick={() =>
                      onUpdate(s.id, {
                        loadUnit: s.loadUnit === "banda" ? "kg" : "banda",
                      })
                    }
                    className="font-sans text-[10px] uppercase tracking-wider text-coffee/40 hover:text-coffee"
                  >
                    {(s.loadUnit ?? "kg") === "kg" ? "Kg ⇄" : "Banda ⇄"}
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.load ?? ""}
                    onChange={(e) =>
                      onUpdate(s.id, {
                        load:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    placeholder="–"
                    className="w-full bg-transparent text-center font-serif text-lg text-espresso placeholder:text-coffee/25 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() => onAdd()}
          className="w-full rounded-2xl border border-dashed border-coffee/25 py-2.5 font-sans text-sm text-coffee/50 hover:border-coffee/40 hover:text-coffee/70"
        >
          + Añadir ejercicio
        </button>
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-white/70 px-2 py-1.5">
      <span className="font-sans text-[10px] uppercase tracking-wider text-coffee/40">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        placeholder="–"
        className="w-full bg-transparent text-center font-serif text-lg text-espresso placeholder:text-coffee/25 focus:outline-none"
      />
    </label>
  );
}

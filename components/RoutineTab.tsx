"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { todayStr, fmtShort, daysBetween, addDays } from "@/lib/dates";
import { weekdayNames } from "@/lib/routine";
import { Exercise, PartKey } from "@/lib/types";

export default function RoutineTab() {
  const { data, setData } = useStore();
  const [reviewing, setReviewing] = useState(false);

  const today = todayStr();
  const endDate = addDays(data.cycle.startDate, data.cycle.weeks * 7);
  const dayNum = Math.max(1, daysBetween(data.cycle.startDate, today) + 1);
  const total = data.cycle.weeks * 7;
  const pct = Math.min(100, Math.round((dayNum / total) * 100));

  const updateExercise = (
    partKey: PartKey,
    exId: string,
    patch: Partial<Exercise>
  ) => {
    setData((prev) => ({
      ...prev,
      routine: {
        ...prev.routine,
        parts: prev.routine.parts.map((p) =>
          p.key === partKey
            ? {
                ...p,
                exercises: p.exercises.map((e) =>
                  e.id === exId ? { ...e, ...patch } : e
                ),
              }
            : p
        ),
      },
    }));
  };

  const updateMuscle = (weekdayIndex: number, value: string) => {
    setData((prev) => {
      const rotation = [...prev.routine.muscleRotation];
      rotation[weekdayIndex] = value;
      return { ...prev, routine: { ...prev.routine, muscleRotation: rotation } };
    });
  };

  const addExercise = (partKey: PartKey) => {
    const id = "x" + Math.random().toString(36).slice(2, 7);
    setData((prev) => ({
      ...prev,
      routine: {
        ...prev.routine,
        parts: prev.routine.parts.map((p) =>
          p.key === partKey
            ? {
                ...p,
                exercises: [
                  ...p.exercises,
                  { id, name: "Nuevo ejercicio", targetValue: 5, unit: "min" },
                ],
              }
            : p
        ),
      },
    }));
  };

  const removeExercise = (partKey: PartKey, exId: string) => {
    setData((prev) => ({
      ...prev,
      routine: {
        ...prev.routine,
        parts: prev.routine.parts.map((p) =>
          p.key === partKey
            ? { ...p, exercises: p.exercises.filter((e) => e.id !== exId) }
            : p
        ),
      },
    }));
  };

  const closeCycle = (liked: number, notes: string) => {
    setData((prev) => {
      const closed = {
        ...prev.cycle,
        review: { liked, notes, closedDate: today },
      };
      const nextLevel = liked >= 3 ? prev.cycle.level + 1 : prev.cycle.level;
      return {
        ...prev,
        cycleHistory: [...prev.cycleHistory, closed],
        cycle: {
          id: "cycle-" + (prev.cycleHistory.length + 2),
          routineName: prev.cycle.routineName,
          startDate: today,
          weeks: prev.cycle.weeks,
          level: nextLevel,
        },
      };
    });
    setReviewing(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-cream/60">
          Estructura
        </p>
        <h1 className="font-serif text-4xl text-cream">Mi rutina</h1>
      </header>

      {/* Ciclo de prueba */}
      <section className="rounded-xl2 bg-coffee p-5 text-cream shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-cream/60">
              Ciclo en prueba · nivel {data.cycle.level}
            </p>
            <h2 className="font-serif text-2xl">{data.cycle.routineName}</h2>
          </div>
          <span className="rounded-full bg-cream/15 px-3 py-1 font-sans text-xs">
            {data.cycle.weeks} semanas
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream/20">
          <div
            className="h-full rounded-full bg-sage transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 font-sans text-xs text-cream/70">
          Día {Math.min(dayNum, total)} de {total} · termina el{" "}
          {fmtShort(endDate)}
        </p>

        {dayNum >= total ? (
          <button
            onClick={() => setReviewing(true)}
            className="mt-4 w-full rounded-2xl bg-gold py-3 font-serif text-lg font-semibold text-espresso"
          >
            🎯 Cerrar ciclo y subir de nivel
          </button>
        ) : (
          <button
            onClick={() => setReviewing(true)}
            className="mt-4 w-full rounded-2xl bg-cream/15 py-3 font-sans text-sm text-cream/90 hover:bg-cream/25"
          >
            Cerrar ciclo antes de tiempo
          </button>
        )}
      </section>

      {reviewing && (
        <CycleReview
          level={data.cycle.level}
          onCancel={() => setReviewing(false)}
          onSubmit={closeCycle}
        />
      )}

      {/* Partes editables */}
      <section className="space-y-4">
        {data.routine.parts.map((part, i) => (
          <div
            key={part.key}
            className="rounded-xl2 bg-panel p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-sans text-xs uppercase tracking-wider text-coffee/50">
                  Parte {i + 1} · {part.place}
                </p>
                <h3 className="font-serif text-2xl text-espresso">
                  {part.title}
                </h3>
              </div>
            </div>

            {part.key !== "fuerza" && (
            <ul className="space-y-2">
              {part.exercises.map((ex) => (
                <li
                  key={ex.id}
                  className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2"
                >
                  <input
                    value={ex.name}
                    onChange={(e) =>
                      updateExercise(part.key, ex.id, { name: e.target.value })
                    }
                    className="flex-1 bg-transparent font-sans text-sm text-coffee focus:outline-none"
                  />
                  <input
                    type="number"
                    value={ex.targetValue ?? ""}
                    onChange={(e) =>
                      updateExercise(part.key, ex.id, {
                        targetValue:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    className="w-12 rounded-lg border border-coffee/15 bg-white px-1 py-0.5 text-center font-sans text-sm text-coffee focus:outline-none"
                  />
                  <input
                    value={ex.unit ?? ""}
                    onChange={(e) =>
                      updateExercise(part.key, ex.id, { unit: e.target.value })
                    }
                    className="w-12 bg-transparent text-center font-sans text-xs text-coffee/50 focus:outline-none"
                  />
                  <button
                    onClick={() => removeExercise(part.key, ex.id)}
                    className="text-coffee/30 hover:text-clay"
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            )}

            {part.key === "fuerza" && (
              <div className="mt-3 rounded-2xl bg-cream p-3">
                <p className="mb-2 px-1 font-sans text-xs uppercase tracking-wider text-coffee/50">
                  Grupo muscular por día
                </p>
                <div className="space-y-1.5">
                  {weekdayNames.map((wd, i) => (
                    <div key={wd} className="flex items-center gap-2">
                      <span className="w-24 font-sans text-sm text-coffee/60">
                        {wd}
                      </span>
                      <input
                        value={data.routine.muscleRotation[i] ?? ""}
                        onChange={(e) => updateMuscle(i, e.target.value)}
                        className="flex-1 rounded-lg border border-coffee/15 bg-white px-2 py-1 font-sans text-sm text-coffee focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {part.key !== "fuerza" && (
              <button
                onClick={() => addExercise(part.key)}
                className="mt-2 w-full rounded-2xl border border-dashed border-coffee/25 py-2 font-sans text-sm text-coffee/50 hover:border-coffee/40 hover:text-coffee/70"
              >
                + Añadir ejercicio
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Historial de ciclos */}
      {data.cycleHistory.length > 0 && (
        <section>
          <h2 className="mb-2 font-serif text-2xl text-cream">
            Ciclos anteriores
          </h2>
          <div className="space-y-2">
            {data.cycleHistory.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl bg-sand px-4 py-3"
              >
                <div>
                  <p className="font-sans text-sm text-coffee">
                    Nivel {c.level} · {c.weeks} sem
                  </p>
                  <p className="text-xs text-coffee/50">
                    {fmtShort(c.startDate)}
                    {c.review && ` · ${"★".repeat(c.review.liked)}`}
                  </p>
                </div>
                {c.review?.notes && (
                  <p className="max-w-[55%] text-right text-xs italic text-coffee/50">
                    “{c.review.notes}”
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CycleReview({
  level,
  onCancel,
  onSubmit,
}: {
  level: number;
  onCancel: () => void;
  onSubmit: (liked: number, notes: string) => void;
}) {
  const [liked, setLiked] = useState(4);
  const [notes, setNotes] = useState("");

  return (
    <section className="rounded-xl2 border-2 border-gold bg-white/80 p-5 shadow-md">
      <h2 className="font-serif text-2xl text-espresso">¿Cómo te fue?</h2>
      <p className="font-sans text-sm text-coffee/60">
        Si te gustó (3★ o más) subimos al nivel {level + 1} con un poco más de
        intensidad.
      </p>

      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setLiked(s)}
            className={`flex-1 rounded-2xl py-3 text-xl ${
              s <= liked ? "bg-gold/30" : "bg-cream"
            }`}
          >
            {s <= liked ? "★" : "☆"}
          </button>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="¿Qué funcionó? ¿Qué subimos o bajamos para el próximo ciclo?"
        className="mt-3 w-full resize-none rounded-2xl border border-coffee/15 bg-cream px-4 py-3 font-sans text-sm text-coffee placeholder:text-coffee/30 focus:outline-none"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-2xl bg-cream py-3 font-sans text-sm text-coffee/60"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSubmit(liked, notes)}
          className="flex-1 rounded-2xl bg-coffee py-3 font-serif text-lg text-cream"
        >
          {liked >= 3 ? `Subir a nivel ${level + 1}` : "Repetir nivel"}
        </button>
      </div>
    </section>
  );
}

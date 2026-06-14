"use client";

import { useMemo, useState } from "react";
import { useStore, emptyLog } from "@/lib/store";
import { energyProfiles, profileForEnergy, muscleForDate } from "@/lib/routine";
import { fmtLong, todayStr, daysBetween } from "@/lib/dates";
import { currentStreak } from "@/lib/progress";
import { DayLog, RoutinePart, StrengthEntry } from "@/lib/types";

export default function TodayTab() {
  const { data, getLog, upsertLog } = useStore();
  const today = todayStr();
  const existing = getLog(today);
  const [draft, setDraft] = useState<DayLog>(existing ?? emptyLog(today));

  // Mantén sincronizado si cambia el log externo (ej. reset)
  const log = existing ?? draft;
  const setLog = (next: DayLog) => {
    setDraft(next);
    upsertLog(next);
  };

  const profile = profileForEnergy(log.energy);
  const muscle = muscleForDate(data.routine, today);
  const streak = currentStreak(data);

  const cycleDay = daysBetween(data.cycle.startDate, today) + 1;
  const cycleTotal = data.cycle.weeks * 7;

  // Partes activas según energía
  const activeParts = useMemo(
    () =>
      data.routine.parts.filter((p) => profile.parts.includes(p.key)),
    [data.routine.parts, profile.parts]
  );

  const toggleExercise = (exId: string, done: boolean) => {
    const others = log.exercises.filter((e) => e.exerciseId !== exId);
    setLog({
      ...log,
      exercises: [...others, { exerciseId: exId, done }],
    });
  };

  const setRealValue = (exId: string, val: number | undefined) => {
    const ex = log.exercises.find((e) => e.exerciseId === exId);
    const others = log.exercises.filter((e) => e.exerciseId !== exId);
    setLog({
      ...log,
      exercises: [
        ...others,
        { exerciseId: exId, done: ex?.done ?? false, realValue: val },
      ],
    });
  };

  const exLog = (exId: string) =>
    log.exercises.find((e) => e.exerciseId === exId);

  // ---- Fuerza: ejercicios con series y repeticiones ----
  const strength = log.strength ?? [];
  const setStrength = (next: StrengthEntry[]) =>
    setLog({ ...log, strength: next });
  const addStrength = () =>
    setStrength([
      ...strength,
      { id: "s" + Math.random().toString(36).slice(2, 7), name: "" },
    ]);
  const updateStrength = (id: string, patch: Partial<StrengthEntry>) =>
    setStrength(strength.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeStrength = (id: string) =>
    setStrength(strength.filter((s) => s.id !== id));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <header>
        <div className="flex items-center justify-between">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-coffee/50">
            Mi laboratorio
          </p>
          {streak > 0 && (
            <span className="rounded-full bg-clay/15 px-3 py-1 text-xs font-semibold text-clay">
              🔥 {streak} {streak === 1 ? "día" : "días"}
            </span>
          )}
        </div>
        <h1 className="mt-1 font-serif text-3xl capitalize leading-tight text-espresso">
          {fmtLong(today)}
        </h1>
        <p className="mt-1 font-sans text-sm text-coffee/60">
          Ciclo «{data.cycle.routineName}» · día {cycleDay} de {cycleTotal} ·
          nivel {data.cycle.level}
        </p>
      </header>

      {/* Selector de energía */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">
          ¿Cómo está tu energía hoy?
        </h2>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[5, 4, 3, 2, 1, 0].map((lvl) => {
            const p = energyProfiles[lvl];
            const sel = log.energy === lvl;
            return (
              <button
                key={lvl}
                onClick={() =>
                  setLog({
                    ...log,
                    energy: lvl,
                    isPeriod: lvl === 0 ? true : log.isPeriod,
                  })
                }
                className={`flex min-w-[78px] flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 transition ${
                  sel
                    ? "border-coffee shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: p.color + (sel ? "" : "99") }}
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-[11px] font-semibold leading-tight text-espresso">
                  {lvl}/5
                </span>
                <span className="text-[9px] leading-tight text-espresso/70">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 rounded-2xl bg-cream px-4 py-3 font-sans text-sm text-coffee">
          {profile.message}
        </p>

        <label className="mt-3 flex items-center gap-2 font-sans text-sm text-coffee/70">
          <input
            type="checkbox"
            checked={log.isPeriod}
            onChange={(e) => setLog({ ...log, isPeriod: e.target.checked })}
            className="h-4 w-4 accent-clay"
          />
          Estoy en mi periodo 🤍
        </label>
      </section>

      {/* Plan sugerido por partes */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-espresso">
          Tu plan de hoy
        </h2>
        {activeParts.map((part, idx) =>
          part.key === "fuerza" ? (
            <StrengthCard
              key={part.key}
              index={idx}
              muscle={muscle}
              entries={strength}
              onAdd={addStrength}
              onUpdate={updateStrength}
              onRemove={removeStrength}
            />
          ) : (
            <PartCard
              key={part.key}
              part={part}
              index={idx}
              intensity={profile.intensity}
              exLog={exLog}
              onToggle={toggleExercise}
              onReal={setRealValue}
            />
          )
        )}
      </section>

      {/* Cierre del día */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">Cierre del día</h2>

        <label className="mt-3 block font-sans text-sm text-coffee/70">
          ¿Cómo te sentiste después?
        </label>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((m) => (
            <button
              key={m}
              onClick={() => setLog({ ...log, moodAfter: m })}
              className={`flex-1 rounded-2xl py-3 text-xl transition ${
                log.moodAfter === m
                  ? "bg-gold/30 ring-2 ring-gold"
                  : "bg-cream hover:bg-sand"
              }`}
            >
              {["😣", "😕", "😌", "🙂", "😄"][m - 1]}
            </button>
          ))}
        </div>

        <label className="mt-4 block font-sans text-sm text-coffee/70">
          Notas (¿qué cambiarías?, ¿qué te costó?)
        </label>
        <textarea
          value={log.notes ?? ""}
          onChange={(e) => setLog({ ...log, notes: e.target.value })}
          rows={2}
          placeholder="Ej. los sprints me costaron, hice 5 min de elíptica…"
          className="mt-1 w-full resize-none rounded-2xl border border-coffee/15 bg-cream px-4 py-3 font-sans text-sm text-coffee placeholder:text-coffee/30 focus:border-coffee/40 focus:outline-none"
        />

        <button
          onClick={() => setLog({ ...log, completed: !log.completed })}
          className={`mt-4 w-full rounded-2xl py-4 font-serif text-xl font-semibold transition ${
            log.completed
              ? "bg-sageDeep text-white"
              : "bg-coffee text-cream hover:bg-espresso"
          }`}
        >
          {log.completed ? "✓ Día completado" : "Marcar día como hecho"}
        </button>
      </section>
    </div>
  );
}

function PartCard({
  part,
  index,
  intensity,
  exLog,
  onToggle,
  onReal,
}: {
  part: RoutinePart;
  index: number;
  intensity: number;
  exLog: (id: string) => { done: boolean; realValue?: number } | undefined;
  onToggle: (id: string, done: boolean) => void;
  onReal: (id: string, val: number | undefined) => void;
}) {
  const [open, setOpen] = useState(true);
  const doneCount = part.exercises.filter((e) => exLog(e.id)?.done).length;

  return (
    <div className="overflow-hidden rounded-xl2 bg-white/60 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="font-sans text-xs uppercase tracking-wider text-coffee/50">
            Parte {index + 1} · {part.place}
          </p>
          <h3 className="font-serif text-2xl text-espresso">{part.title}</h3>
        </div>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-coffee/60">
          {doneCount}/{part.exercises.length}
        </span>
      </button>

      {open && (
        <ul className="space-y-1 px-3 pb-3">
          {part.exercises.map((ex) => {
            const el = exLog(ex.id);
            const target = ex.targetValue
              ? Math.round(ex.targetValue * intensity)
              : undefined;
            return (
              <li
                key={ex.id}
                className="flex items-center gap-3 rounded-2xl px-2 py-2"
              >
                <button
                  onClick={() => onToggle(ex.id, !el?.done)}
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                    el?.done
                      ? "border-sageDeep bg-sageDeep text-white"
                      : "border-coffee/25"
                  }`}
                >
                  {el?.done && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1">
                  <p
                    className={`font-sans text-sm ${
                      el?.done
                        ? "text-coffee/40 line-through"
                        : "text-coffee"
                    }`}
                  >
                    {ex.name}
                  </p>
                  {ex.note && (
                    <p className="text-[11px] text-coffee/40">{ex.note}</p>
                  )}
                </div>
                {target !== undefined && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={el?.realValue ?? ""}
                      onChange={(e) =>
                        onReal(
                          ex.id,
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                      placeholder={String(target)}
                      className="w-12 rounded-xl border border-coffee/15 bg-cream px-2 py-1 text-center font-sans text-sm text-coffee placeholder:text-coffee/30 focus:border-coffee/40 focus:outline-none"
                    />
                    <span className="text-[11px] text-coffee/40">
                      /{target}
                      {ex.unit}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---- Tarjeta de Fuerza: registra ejercicios con series y repeticiones ----
function StrengthCard({
  index,
  muscle,
  entries,
  onAdd,
  onUpdate,
  onRemove,
}: {
  index: number;
  muscle: string;
  entries: StrengthEntry[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<StrengthEntry>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl2 bg-white/60 shadow-sm">
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-wider text-coffee/50">
            Parte {index + 1} · En casa
          </p>
          <h3 className="font-serif text-2xl text-espresso">Fuerza</h3>
        </div>
        <span className="rounded-full bg-sage/40 px-3 py-1 font-sans text-xs font-semibold text-espresso">
          {muscle}
        </span>
      </div>

      <div className="space-y-2 px-3 pb-3 pt-3">
        {entries.length === 0 && (
          <p className="px-2 font-sans text-sm text-coffee/40">
            ¿Qué ejercicios hiciste hoy? Añade cada uno con sus series y reps.
          </p>
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
                placeholder="Ejercicio (ej. Sentadillas)"
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
            <div className="mt-2 flex gap-2 pl-5">
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
              <NumField
                label="Kg"
                value={s.weight}
                onChange={(v) => onUpdate(s.id, { weight: v })}
              />
            </div>
          </div>
        ))}

        <button
          onClick={onAdd}
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

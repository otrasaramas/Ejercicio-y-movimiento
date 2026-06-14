"use client";

import { useMemo, useState } from "react";
import { useStore, emptyLog } from "@/lib/store";
import { energyProfiles, profileForEnergy, muscleForDate } from "@/lib/routine";
import { fmtLong, todayStr, daysBetween, addDays } from "@/lib/dates";
import { currentStreak } from "@/lib/progress";
import { DayLog, ExerciseLog, RoutinePart, StrengthEntry } from "@/lib/types";
import { exercisesForMuscle, yogaPoses } from "@/lib/routine";
import ExerciseLogger from "./ExerciseLogger";

export default function TodayTab() {
  const { data, getLog, upsertLog } = useStore();
  const today = todayStr();

  // Fecha que se está registrando (permite anotar días pasados)
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;
  const isPast = selectedDate < today;

  // El registro siempre se lee/escribe en el store por fecha
  const log = getLog(selectedDate) ?? emptyLog(selectedDate);
  const setLog = (next: DayLog) => upsertLog(next);

  const goToDate = (d: string) => {
    if (d <= today) setSelectedDate(d);
  };

  const profile = profileForEnergy(log.energy);
  const muscle = muscleForDate(data.routine, selectedDate);
  const streak = currentStreak(data);

  const cycleDay = daysBetween(data.cycle.startDate, selectedDate) + 1;
  const cycleTotal = data.cycle.weeks * 7;

  // Partes activas según energía
  const activeParts = useMemo(
    () =>
      data.routine.parts.filter((p) => profile.parts.includes(p.key)),
    [data.routine.parts, profile.parts]
  );

  // Actualiza un ejercicio del gimnasio preservando los demás campos
  const patchExercise = (exId: string, patch: Partial<ExerciseLog>) => {
    const ex = log.exercises.find((e) => e.exerciseId === exId);
    const others = log.exercises.filter((e) => e.exerciseId !== exId);
    setLog({
      ...log,
      exercises: [
        ...others,
        { exerciseId: exId, done: ex?.done ?? false, ...ex, ...patch },
      ],
    });
  };
  const toggleExercise = (exId: string, done: boolean) =>
    patchExercise(exId, { done });
  const setRealValue = (exId: string, val: number | undefined) =>
    patchExercise(exId, { realValue: val });
  const setLevel = (exId: string, val: number | undefined) =>
    patchExercise(exId, { level: val });

  const exLog = (exId: string) =>
    log.exercises.find((e) => e.exerciseId === exId);

  // ---- Logger reutilizable para Fuerza y Yoga ----
  const makeLogger = (key: "strength" | "yoga") => {
    const list = log[key] ?? [];
    const set = (next: StrengthEntry[]) => setLog({ ...log, [key]: next });
    return {
      list,
      add: (name?: string) =>
        set([
          ...list,
          {
            id: "s" + Math.random().toString(36).slice(2, 7),
            name: name ?? "",
          },
        ]),
      update: (id: string, patch: Partial<StrengthEntry>) =>
        set(list.map((s) => (s.id === id ? { ...s, ...patch } : s))),
      remove: (id: string) => set(list.filter((s) => s.id !== id)),
    };
  };
  const strengthL = makeLogger("strength");
  const yogaL = makeLogger("yoga");

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <header>
        <div className="h-2 w-full rounded-full bg-sky stripes-v text-cream/40" />
        <div className="mt-3 flex items-center justify-between">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-coffee/50">
            {isToday ? "Mi laboratorio" : "Registrando día pasado"}
          </p>
          {streak > 0 && (
            <span className="rounded-full bg-clay px-3 py-1 text-xs font-bold text-cream">
              🔥 {streak} {streak === 1 ? "día" : "días"}
            </span>
          )}
        </div>
        <h1 className="mt-1 font-serif text-3xl capitalize leading-tight text-espresso">
          {fmtLong(selectedDate)}
        </h1>
        <p className="mt-1 font-sans text-sm text-coffee/60">
          Ciclo «{data.cycle.routineName}» · día {cycleDay} de {cycleTotal} ·
          nivel {data.cycle.level}
        </p>

        {/* Navegación de fechas (registrar días pasados) */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => goToDate(addDays(selectedDate, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee font-bold text-cream"
            aria-label="Día anterior"
          >
            ‹
          </button>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => e.target.value && goToDate(e.target.value)}
            className="flex-1 rounded-full border border-coffee/15 bg-white/70 px-3 py-2 text-center font-sans text-sm text-coffee focus:outline-none"
          />
          <button
            onClick={() => goToDate(addDays(selectedDate, 1))}
            disabled={isToday}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee font-bold text-cream disabled:opacity-30"
            aria-label="Día siguiente"
          >
            ›
          </button>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(today)}
              className="rounded-full bg-gold px-3 py-2 font-sans text-xs font-bold text-espresso"
            >
              Hoy
            </button>
          )}
        </div>
        {isPast && (
          <p className="mt-2 rounded-2xl bg-gold/25 px-4 py-2 font-sans text-xs text-coffee/70">
            ✍️ Estás anotando un día que se te pasó. Todo lo que registres aquí
            cuenta para tus rachas y análisis.
          </p>
        )}
      </header>

      {/* Selector de energía */}
      <section className="rounded-xl2 bg-white/60 p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-espresso">
          {isToday ? "¿Cómo está tu energía hoy?" : "¿Cómo estuvo tu energía?"}
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
            <ExerciseLogger
              key={part.key}
              index={idx}
              title="Fuerza"
              place="En casa"
              badge={muscle}
              suggestions={exercisesForMuscle(muscle)}
              showLoad
              emptyHint="Toca un sugerido o añade los ejercicios que hiciste hoy con sus series, reps y carga (kg o banda)."
              entries={strengthL.list}
              onAdd={strengthL.add}
              onUpdate={strengthL.update}
              onRemove={strengthL.remove}
            />
          ) : part.key === "yoga" ? (
            <ExerciseLogger
              key={part.key}
              index={idx}
              title="Yoga"
              place="En casa"
              suggestions={yogaPoses}
              showLoad={false}
              emptyHint="Añade las posturas/ejercicios que hiciste con sus series y repeticiones."
              entries={yogaL.list}
              onAdd={yogaL.add}
              onUpdate={yogaL.update}
              onRemove={yogaL.remove}
            />
          ) : (
            <PartCard
              key={part.key}
              part={part}
              index={idx}
              intensity={profile.intensity}
              showLevel={part.key === "gimnasio"}
              exLog={exLog}
              onToggle={toggleExercise}
              onReal={setRealValue}
              onLevel={setLevel}
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
  showLevel,
  exLog,
  onToggle,
  onReal,
  onLevel,
}: {
  part: RoutinePart;
  index: number;
  intensity: number;
  showLevel?: boolean;
  exLog: (id: string) => ExerciseLog | undefined;
  onToggle: (id: string, done: boolean) => void;
  onReal: (id: string, val: number | undefined) => void;
  onLevel: (id: string, val: number | undefined) => void;
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
                {showLevel && (
                  <label className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-coffee/40">
                      Nivel
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      value={el?.level ?? ""}
                      onChange={(e) =>
                        onLevel(
                          ex.id,
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                      placeholder="–"
                      className="w-12 rounded-xl border border-coffee/15 bg-cream px-2 py-1 text-center font-sans text-sm text-coffee placeholder:text-coffee/30 focus:border-coffee/40 focus:outline-none"
                    />
                  </label>
                )}
                {target !== undefined && (
                  <label className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-coffee/40">
                      Hice
                    </span>
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
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

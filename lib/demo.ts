import { AppData, DayLog } from "./types";
import { initialData, profileForEnergy } from "./routine";
import { addDays, todayStr } from "./dates";

// Genera datos de ejemplo para ver la app poblada (rachas, peso, medidas)
export function demoData(): AppData {
  const base = initialData();
  const today = todayStr();
  base.cycle.startDate = addDays(today, -16);

  const logs: Record<string, DayLog> = {};
  // 18 días hacia atrás con buena constancia (algún hueco)
  for (let i = 18; i >= 0; i--) {
    const date = addDays(today, -i);
    // deja un par de huecos para que se vea realista
    if (i === 5 || i === 11) continue;
    const energy = [5, 4, 3, 5, 4, 2, 5][i % 7];
    const profile = profileForEnergy(energy);
    logs[date] = {
      date,
      energy,
      isPeriod: energy === 0,
      partsDone: {},
      exercises: base.routine.parts.flatMap((p) =>
        profile.parts.includes(p.key)
          ? p.exercises.map((e) => ({
              exerciseId: e.id,
              done: true,
              realValue: e.targetValue
                ? Math.round(e.targetValue * profile.intensity)
                : undefined,
            }))
          : []
      ),
      strength: profile.parts.includes("fuerza")
        ? [
            { id: "sd1", name: "Sentadillas", series: 3, reps: 12, weight: 10 },
            { id: "sd2", name: "Peso muerto", series: 3, reps: 10, weight: 15 },
            { id: "sd3", name: "Zancadas", series: 3, reps: 12 },
          ]
        : undefined,
      moodAfter: Math.min(5, energy + 1),
      completed: true,
    };
  }
  base.logs = logs;

  // Peso: tendencia suave a la baja
  base.weights = [];
  let kg = 68;
  for (let i = 8; i >= 0; i--) {
    base.weights.push({
      date: addDays(today, -i * 4),
      kg: +(kg).toFixed(1),
    });
    kg -= Math.random() * 0.6;
  }

  // Medidas: dos meses
  base.measurements = [
    {
      date: addDays(today, -30),
      cintura: 74,
      cadera: 98,
      pecho: 90,
      brazo: 28,
      muslo: 56,
      gluteo: 99,
    },
    {
      date: today,
      cintura: 72.5,
      cadera: 97,
      pecho: 89,
      brazo: 28.5,
      muslo: 55,
      gluteo: 99.5,
    },
  ];

  return base;
}

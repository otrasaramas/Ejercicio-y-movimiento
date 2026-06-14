import { AppData, PartKey, Routine } from "./types";

// ---------- Rutina por defecto (la que describiste) ----------
export const defaultRoutine: Routine = {
  name: "Rutina de arranque",
  muscleRotation: [
    "Abdomen",
    "Brazos",
    "Pecho",
    "Piernas",
    "Espalda",
    "Glúteos",
    "Core completo",
  ],
  parts: [
    {
      key: "gimnasio",
      title: "Gimnasio",
      place: "Gimnasio",
      exercises: [
        { id: "g1", name: "Caminata", targetValue: 20, unit: "min" },
        { id: "g2", name: "Sprint", targetValue: 3, unit: "min", note: "Sprint 3 / rest 3" },
        { id: "g3", name: "Sprint", targetValue: 3, unit: "min", note: "Sprint 3 / rest 3" },
        { id: "g4", name: "Sprint", targetValue: 3, unit: "min", note: "Total: 9 min corriendo" },
        { id: "g5", name: "Elíptica nivel 1", targetValue: 5, unit: "min" },
        { id: "g6", name: "Elíptica nivel 3", targetValue: 5, unit: "min" },
        { id: "g7", name: "Elíptica nivel 5", targetValue: 5, unit: "min" },
      ],
    },
    {
      key: "fuerza",
      title: "Fuerza",
      place: "En casa",
      exercises: [
        { id: "f1", name: "Grupo muscular del día", targetValue: 15, unit: "min", note: "Rota cada día" },
      ],
    },
    {
      key: "yoga",
      title: "Yoga",
      place: "En casa",
      exercises: [
        { id: "y1", name: "10 ejercicios de relajación y estiramiento", targetValue: 30, unit: "min" },
      ],
    },
  ],
};

// ---------- Niveles de energía y adaptación del plan ----------
export interface EnergyProfile {
  level: number;
  label: string;
  emoji: string;
  color: string;
  // Qué partes sugiere trabajar
  parts: PartKey[];
  // Multiplicador sobre el objetivo (ej. 0.5 = la mitad)
  intensity: number;
  message: string;
}

export const energyProfiles: Record<number, EnergyProfile> = {
  5: {
    level: 5,
    label: "Full energía",
    emoji: "🔥",
    color: "#A9B79E",
    parts: ["gimnasio", "fuerza", "yoga"],
    intensity: 1,
    message: "Plan completo. Hoy vamos con todo 💪",
  },
  4: {
    level: 4,
    label: "Bien",
    emoji: "🌿",
    color: "#C9D2BE",
    parts: ["gimnasio", "fuerza", "yoga"],
    intensity: 0.8,
    message: "Plan casi completo, baja un poco la intensidad de los sprints.",
  },
  3: {
    level: 3,
    label: "Normal",
    emoji: "🙂",
    color: "#E2A75A",
    parts: ["gimnasio", "yoga"],
    intensity: 0.6,
    message: "Cardio suave + yoga. Saltamos la fuerza pesada hoy.",
  },
  2: {
    level: 2,
    label: "Bajita",
    emoji: "🍂",
    color: "#C08475",
    parts: ["gimnasio", "yoga"],
    intensity: 0.4,
    message: "Caminata ligera y yoga. Movernos suave es suficiente.",
  },
  1: {
    level: 1,
    label: "Cansada",
    emoji: "🌙",
    color: "#A9C0D4",
    parts: ["yoga"],
    intensity: 0.3,
    message: "Solo estiramiento y respiración. Tu cuerpo lo agradece.",
  },
  0: {
    level: 0,
    label: "Periodo / descanso",
    emoji: "🤍",
    color: "#E4E3DD",
    parts: ["yoga"],
    intensity: 0.2,
    message: "Día de descanso restaurativo. Yoga muy suave si te provoca, sin presión.",
  },
};

export function profileForEnergy(energy: number): EnergyProfile {
  return energyProfiles[Math.max(0, Math.min(5, energy))];
}

// Grupo muscular sugerido para una fecha (rotación por día del año)
export function muscleForDate(routine: Routine, dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const rot = routine.muscleRotation;
  return rot[dayOfYear % rot.length];
}

// ---------- Estado inicial ----------
export function initialData(): AppData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    routine: defaultRoutine,
    cycle: {
      id: "cycle-1",
      routineName: defaultRoutine.name,
      startDate: today,
      weeks: 3,
      level: 1,
    },
    cycleHistory: [],
    logs: {},
    weights: [],
    measurements: [],
    earnedMedals: [],
  };
}

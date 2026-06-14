import { AppData, PartKey, Routine } from "./types";

// ---------- Rutina por defecto (la que describiste) ----------
// Grupo muscular asignado a cada día de la semana.
// Índice = Date.getDay(): 0=Domingo, 1=Lunes, … 6=Sábado
export const defaultRoutine: Routine = {
  name: "Rutina de arranque",
  muscleRotation: [
    "Descanso / Core", // Domingo
    "Piernas", // Lunes
    "Brazos", // Martes
    "Abdomen", // Miércoles
    "Espalda", // Jueves
    "Pecho", // Viernes
    "Glúteos", // Sábado
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

// Grupo muscular asignado al día de la semana de esa fecha
export function muscleForDate(routine: Routine, dateStr: string): string {
  const weekday = new Date(dateStr + "T00:00:00").getDay();
  return routine.muscleRotation[weekday] ?? routine.muscleRotation[0];
}

export const weekdayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Ejercicios sugeridos por grupo muscular (para registrar lo que hiciste)
export const muscleExercises: Record<string, string[]> = {
  Piernas: ["Sentadillas", "Zancadas", "Peso muerto", "Prensa", "Pantorrillas"],
  Brazos: ["Curl bíceps", "Fondos tríceps", "Curl martillo", "Press hombro"],
  Abdomen: ["Plancha", "Crunch", "Elevación de piernas", "Bicicleta", "Russian twist"],
  Espalda: ["Remo", "Jalón al pecho", "Superman", "Pull-over"],
  Pecho: ["Flexiones", "Press banca", "Aperturas", "Press inclinado"],
  Glúteos: ["Hip thrust", "Patada de glúteo", "Puente", "Sentadilla sumo"],
  "Core completo": ["Plancha", "Mountain climbers", "Bird-dog", "Dead bug"],
  "Descanso / Core": ["Plancha suave", "Respiración", "Bird-dog"],
};

export function exercisesForMuscle(muscle: string): string[] {
  return muscleExercises[muscle] ?? [];
}

// Posturas de yoga sugeridas
export const yogaPoses = [
  "Postura del niño",
  "Perro boca abajo",
  "Gato-vaca",
  "Guerrero I",
  "Guerrero II",
  "Triángulo",
  "Cobra",
  "Paloma",
  "Torsión sentada",
  "Savasana",
];

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

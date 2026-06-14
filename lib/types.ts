// ---------- Modelo de datos del laboratorio de ejercicio ----------

export type PartKey = "calentamiento" | "gimnasio" | "fuerza" | "yoga";

export interface Exercise {
  id: string;
  name: string;
  // Meta objetivo: puede ser minutos, repeticiones, etc.
  targetValue?: number;
  unit?: string; // "min", "reps", "series", etc.
  note?: string;
}

export interface RoutinePart {
  key: PartKey;
  title: string;
  place: string; // "En casa", "Gimnasio"
  exercises: Exercise[];
}

export interface Routine {
  name: string;
  parts: RoutinePart[];
  // Rotación de grupos musculares para la parte de fuerza
  muscleRotation: string[];
}

// ---------- Ciclo de prueba (ej. 3 semanas) ----------
export interface Cycle {
  id: string;
  routineName: string;
  startDate: string; // YYYY-MM-DD
  weeks: number;
  level: number; // nivel de intensidad (sube cada ciclo)
  // Reseña al terminar
  review?: {
    liked: number; // 1-5
    notes: string;
    closedDate: string;
  };
}

// ---------- Registro diario ----------
export interface ExerciseLog {
  exerciseId: string;
  done: boolean;
  realValue?: number; // lo que realmente hizo (ej. 5 min en vez de 10)
}

// Un ejercicio de fuerza registrado en el día (ej. Sentadillas 3x12)
export interface StrengthEntry {
  id: string;
  name: string;
  series?: number;
  reps?: number;
  weight?: number; // kg opcional
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  energy: number; // 0-5
  isPeriod: boolean;
  // Partes que decidió/pudo trabajar
  partsDone: Partial<Record<PartKey, boolean>>;
  exercises: ExerciseLog[];
  // Registro detallado de la parte de fuerza
  strength?: StrengthEntry[];
  moodAfter?: number; // 1-5, cómo se sintió después
  notes?: string;
  completed: boolean; // marcó el día como hecho
}

export interface WeightEntry {
  date: string;
  kg: number;
}

export interface MeasurementEntry {
  date: string; // mensual
  // centímetros
  cintura?: number;
  cadera?: number;
  pecho?: number;
  brazo?: number;
  muslo?: number;
  gluteo?: number;
}

export interface AppData {
  routine: Routine;
  cycle: Cycle;
  cycleHistory: Cycle[];
  logs: Record<string, DayLog>; // por fecha
  weights: WeightEntry[];
  measurements: MeasurementEntry[];
  earnedMedals: string[]; // ids de medallas conseguidas
}

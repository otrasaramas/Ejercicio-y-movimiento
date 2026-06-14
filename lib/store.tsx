"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AppData, DayLog, MeasurementEntry, WeightEntry } from "./types";
import { initialData } from "./routine";
import { medals } from "./progress";
import { todayStr } from "./dates";

const STORAGE_KEY = "eym-data-v1";

interface StoreContextValue {
  data: AppData;
  ready: boolean;
  setData: (updater: (prev: AppData) => AppData) => void;
  upsertLog: (log: DayLog) => void;
  getLog: (date: string) => DayLog | undefined;
  addWeight: (entry: WeightEntry) => void;
  addMeasurement: (entry: MeasurementEntry) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function syncMedals(d: AppData): AppData {
  const earned = medals.filter((m) => m.earned(d)).map((m) => m.id);
  return { ...d, earnedMedals: earned };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);

  // Cargar de localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppData;
        setDataState({ ...initialData(), ...parsed });
      }
    } catch {
      // ignora datos corruptos
    }
    setReady(true);
  }, []);

  // Guardar en localStorage en cada cambio (después de cargar)
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // almacenamiento lleno o no disponible
    }
  }, [data, ready]);

  const setData = useCallback((updater: (prev: AppData) => AppData) => {
    setDataState((prev) => syncMedals(updater(prev)));
  }, []);

  const upsertLog = useCallback(
    (log: DayLog) => {
      setData((prev) => ({
        ...prev,
        logs: { ...prev.logs, [log.date]: log },
      }));
    },
    [setData]
  );

  const getLog = useCallback(
    (date: string) => data.logs[date],
    [data.logs]
  );

  const addWeight = useCallback(
    (entry: WeightEntry) => {
      setData((prev) => {
        const others = prev.weights.filter((w) => w.date !== entry.date);
        return {
          ...prev,
          weights: [...others, entry].sort((a, b) =>
            a.date.localeCompare(b.date)
          ),
        };
      });
    },
    [setData]
  );

  const addMeasurement = useCallback(
    (entry: MeasurementEntry) => {
      setData((prev) => {
        const others = prev.measurements.filter((m) => m.date !== entry.date);
        return {
          ...prev,
          measurements: [...others, entry].sort((a, b) =>
            a.date.localeCompare(b.date)
          ),
        };
      });
    },
    [setData]
  );

  const reset = useCallback(() => {
    setDataState(syncMedals(initialData()));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        data,
        ready,
        setData,
        upsertLog,
        getLog,
        addWeight,
        addMeasurement,
        reset,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}

// Helper para crear un log nuevo vacío
export function emptyLog(date: string = todayStr()): DayLog {
  return {
    date,
    energy: 5,
    isPeriod: false,
    partsDone: {},
    exercises: [],
    completed: false,
  };
}

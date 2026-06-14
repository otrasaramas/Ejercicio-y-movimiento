"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import TodayTab from "@/components/TodayTab";
import RoutineTab from "@/components/RoutineTab";
import ProgressTab from "@/components/ProgressTab";
import WeightTab from "@/components/WeightTab";
import MeasureTab from "@/components/MeasureTab";

type Tab = "hoy" | "rutina" | "progreso" | "peso" | "medidas";

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "hoy", label: "Hoy", icon: "☀️" },
  { key: "rutina", label: "Rutina", icon: "📋" },
  { key: "progreso", label: "Progreso", icon: "🏅" },
  { key: "peso", label: "Peso", icon: "⚖️" },
  { key: "medidas", label: "Medidas", icon: "📏" },
];

export default function Home() {
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>("hoy");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-cream">
      <div className="flex-1 px-5 pb-28 pt-8">
        {!ready ? (
          <div className="pt-32 text-center font-serif text-2xl text-coffee/40">
            Cargando…
          </div>
        ) : (
          <>
            {tab === "hoy" && <TodayTab />}
            {tab === "rutina" && <RoutineTab />}
            {tab === "progreso" && <ProgressTab />}
            {tab === "peso" && <WeightTab />}
            {tab === "medidas" && <MeasureTab />}
          </>
        )}
      </div>

      {/* Navegación inferior */}
      <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-coffee/10 bg-cream/95 px-2 py-2 backdrop-blur">
        <div className="flex items-center justify-around">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition ${
                tab === t.key
                  ? "text-coffee"
                  : "text-coffee/40 hover:text-coffee/70"
              }`}
            >
              <span
                className={`text-lg transition ${
                  tab === t.key ? "scale-110" : "scale-100 grayscale"
                }`}
              >
                {t.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}

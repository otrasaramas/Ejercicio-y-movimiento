# Ejercicio y Movimiento 🏃‍♀️

Mi laboratorio personal de rutina, energía y progreso. Una app para configurar
cada día de ejercicio, registrar cómo me fue según mi energía, y ver mi
progreso (rachas, medallas, peso y medidas) a lo largo del tiempo.

## Qué hace

- **Hoy** — Eliges tu nivel de energía (0–5) y la app te sugiere el plan
  adaptado: con 5/5 el plan completo, con menos energía versiones más suaves, y
  modo descanso restaurativo en tu periodo. Marcas cada ejercicio, anotas lo que
  realmente hiciste (ej. 5 min en vez de 10) y cómo te sentiste después.
- **Rutina** — La estructura editable de la rutina que estás probando, en 4
  partes (calentamiento, gimnasio, fuerza por grupo muscular rotativo, yoga).
  Funciona por **ciclos** (ej. 3 semanas); al terminar te pregunta si te gustó y
  sube de nivel.
- **Progreso** — Rachas, calendario de constancia y medallas por semanas
  completas y rachas largas.
- **Peso** — Gráfica de peso vs tiempo.
- **Medidas** — Medición mensual con metro y comparación con el mes anterior.

> Consejo: en la pestaña **Progreso** puedes pulsar «Cargar ejemplo» para ver la
> app poblada con datos de muestra.

## Tecnología

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- Los datos se guardan en `localStorage` (solo en tu dispositivo, sin servidor).

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Desplegar en Vercel

1. Sube este repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
3. Vercel detecta Next.js automáticamente. Pulsa **Deploy**. ✅

Sin variables de entorno ni base de datos: funciona tal cual.

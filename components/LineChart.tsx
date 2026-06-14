"use client";

import { fmtShort } from "@/lib/dates";

interface Point {
  date: string;
  value: number;
}

export default function LineChart({
  points,
  color = "#C97B4A",
  unit = "",
  height = 180,
}: {
  points: Point[];
  color?: string;
  unit?: string;
  height?: number;
}) {
  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-coffee/40 font-sans text-sm"
        style={{ height }}
      >
        Aún no hay datos para mostrar
      </div>
    );
  }

  const w = 320;
  const h = height;
  const padX = 28;
  const padY = 22;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = range * 0.15;
  const yMin = min - pad;
  const yMax = max + pad;
  const yRange = yMax - yMin || 1;

  const x = (i: number) =>
    points.length === 1
      ? w / 2
      : padX + (i / (points.length - 1)) * (w - padX * 2);
  const y = (v: number) => padY + (1 - (v - yMin) / yRange) * (h - padY * 2);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`)
    .join(" ");

  const areaPath =
    `M ${x(0)} ${h - padY} ` +
    points.map((p, i) => `L ${x(i)} ${y(p.value)}`).join(" ") +
    ` L ${x(points.length - 1)} ${h - padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* líneas guía */}
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={w - padX}
          y1={padY + t * (h - padY * 2)}
          y2={padY + t * (h - padY * 2)}
          stroke="#5A3A22"
          strokeOpacity="0.08"
          strokeDasharray="3 4"
        />
      ))}

      <path d={areaPath} fill={`url(#grad-${color})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <g key={p.date}>
          <circle cx={x(i)} cy={y(p.value)} r="4" fill={color} />
          <circle cx={x(i)} cy={y(p.value)} r="2" fill="#F3EDE0" />
        </g>
      ))}

      {/* etiquetas extremos */}
      <text x={padX} y={12} fontSize="9" fill="#5A3A22" opacity="0.6">
        {max}
        {unit}
      </text>
      <text x={padX} y={h - 6} fontSize="9" fill="#5A3A22" opacity="0.6">
        {min}
        {unit}
      </text>
      <text
        x={x(0)}
        y={h - 6}
        fontSize="9"
        fill="#5A3A22"
        opacity="0.6"
        textAnchor="middle"
      >
        {fmtShort(points[0].date)}
      </text>
      {points.length > 1 && (
        <text
          x={x(points.length - 1)}
          y={h - 6}
          fontSize="9"
          fill="#5A3A22"
          opacity="0.6"
          textAnchor="middle"
        >
          {fmtShort(points[points.length - 1].date)}
        </text>
      )}
    </svg>
  );
}

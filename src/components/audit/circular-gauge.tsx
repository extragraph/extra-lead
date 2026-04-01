"use client";

import type { AuditScoreSlice } from "@/types/audit";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

function gaugeColor(score: number): string {
  if (score >= 75) return "#34d399";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
}

export function CircularGauge({ slice }: { slice: AuditScoreSlice }) {
  const rest = Math.max(0, 100 - slice.score);
  const data = [
    { name: "rest", value: rest, fill: "var(--gauge-track)" },
    { name: "score", value: slice.score, fill: gaugeColor(slice.score) },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-full max-w-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              isAnimationActive
            >
              {data.map((_, i) => (
                <Cell key={i} fill={data[i].fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span
            className="text-3xl font-semibold tabular-nums"
            style={{ color: gaugeColor(slice.score) }}
          >
            {slice.score}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            / 100
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-sm font-bold tracking-tight text-foreground">{slice.label}</p>
    </div>
  );
}

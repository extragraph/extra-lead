import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function BlockingPointsPanel({ points }: { points: string[] }) {
  if (points.length === 0) return null;

  return (
    <GlassCard className="border-rose-500/15 bg-rose-500/[0.03] p-6 sm:p-7">
      <div className="flex items-center gap-2 text-rose-300">
        <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={1.75} />
        <h3 className="text-lg font-semibold text-white">Points bloquants &amp; priorités</h3>
      </div>
      <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-300">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </GlassCard>
  );
}

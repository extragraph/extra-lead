import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

type BlockingPointsPanelProps = {
  points: string[];
  className?: string;
};

export function BlockingPointsPanel({ points, className = "" }: BlockingPointsPanelProps) {
  if (points.length === 0) return null;

  return (
    <GlassCard
      className={`flex min-h-0 flex-col border-rose-500/15 bg-rose-500/[0.03] p-6 sm:p-7 ${className}`}
    >
      <div className="flex shrink-0 items-center gap-2 text-rose-300">
        <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={1.75} />
        <h3 className="text-lg font-semibold text-white">Points bloquants &amp; priorités</h3>
      </div>
      <ul className="mt-4 min-h-0 flex-1 list-inside list-disc space-y-2 overflow-y-auto pr-1 text-sm leading-relaxed text-zinc-300 [scrollbar-gutter:stable]">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </GlassCard>
  );
}

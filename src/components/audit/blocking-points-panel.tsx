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
      className={`flex min-h-0 flex-col border-rose-200 ring-1 ring-rose-500/10 bg-rose-50 p-6 sm:p-7 shadow-lg dark:!border-rose-500/50 dark:ring-rose-500/20 dark:!bg-none dark:!bg-rose-500/10 dark:shadow-[0_4px_30px_rgba(244,63,94,0.08)] ${className}`}
    >
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400/25 to-red-500/25 text-rose-600 dark:text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <AlertTriangle className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Points bloquants &amp; priorités</h3>
        </div>
        <ul className="mt-5 min-h-0 flex-1 list-inside list-disc space-y-2.5 overflow-y-auto pr-1 text-[15px] leading-relaxed text-muted marker:text-rose-600 dark:marker:text-rose-400 [scrollbar-gutter:stable]">
          {points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
    </GlassCard>
  );
}

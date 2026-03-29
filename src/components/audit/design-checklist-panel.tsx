import type { DesignCheckItem } from "@/types/audit";
import { Check, Circle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

type DesignChecklistPanelProps = {
  checks: DesignCheckItem[];
  className?: string;
};

export function DesignChecklistPanel({ checks, className = "" }: DesignChecklistPanelProps) {
  return (
    <GlassCard className={`flex h-full min-h-0 flex-col p-6 sm:p-7 ${className}`}>
      <h3 className="shrink-0 text-lg font-semibold text-white">Design &amp; UX — contrôles</h3>
      <ul className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
        {checks.map((c) => (
          <li key={c.id} className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-cyan-400">
              {c.ok ? (
                <Check className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Circle className="h-5 w-5 text-zinc-600" strokeWidth={2} />
              )}
            </span>
            <div>
              <p className="font-medium text-zinc-100">{c.label}</p>
              {c.detail && <p className="mt-0.5 text-sm text-zinc-500">{c.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

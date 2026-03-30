import type { AuditPayload } from "@/types/audit";
import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function OpleadSection({ oplead }: { oplead: AuditPayload["oplead"] }) {
  const isAlert = oplead.basicFormPitch;

  return (
      <GlassCard
        variant="strong"
        className="!border-amber-500/50 ring-1 ring-amber-500/20 !bg-none !bg-amber-500/10 p-6 sm:p-7 shadow-[0_4px_30px_rgba(245,158,11,0.08)]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/25 to-orange-500/25 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
            <Sparkles className="h-6 w-6" strokeWidth={1.75} />
          </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-white">{oplead.headline}</h3>
          <p className="text-[15px] leading-relaxed text-zinc-200">{oplead.body}</p>
          {isAlert && !oplead.detectedFromHtml && (
            <p className="text-xs text-zinc-500">
              Indice basé sur une analyse de secours (page HTML non disponible ou partielle).
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

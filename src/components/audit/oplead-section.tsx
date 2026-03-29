import type { AuditPayload } from "@/types/audit";
import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function OpleadSection({ oplead }: { oplead: AuditPayload["oplead"] }) {
  const isAlert = oplead.basicFormPitch;

  return (
    <GlassCard
      variant="strong"
      className={
        isAlert
          ? "border-amber-500/20 bg-amber-500/5 p-6 sm:p-7"
          : "border-violet-500/15 bg-violet-500/[0.04] p-6 sm:p-7"
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div
          className={
            isAlert
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/25 to-violet-500/20 text-amber-300"
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-300"
          }
        >
          <Sparkles className="h-6 w-6" strokeWidth={1.5} />
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

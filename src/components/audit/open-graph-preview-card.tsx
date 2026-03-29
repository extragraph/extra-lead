"use client";

import type { OpenGraphPreview } from "@/types/audit";
import { safeHttpUrl } from "@/lib/audit/open-graph";
import { GlassCard } from "@/components/ui/glass-card";
import { Share2 } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  pageUrl: string;
  og: OpenGraphPreview;
  className?: string;
};

export function OpenGraphPreviewCard({ pageUrl, og, className = "" }: Props) {
  const [imgError, setImgError] = useState(false);
  const hostname = useMemo(() => {
    try {
      return new URL(pageUrl).hostname.replace(/^www\./, "");
    } catch {
      return pageUrl;
    }
  }, [pageUrl]);

  if (!og.present) return null;

  const imgSrc = safeHttpUrl(og.imageUrl ?? undefined);
  const title = og.title?.trim() || "Sans og:title";
  const desc = og.description?.trim() || null;

  return (
    <GlassCard variant="strong" className={`shrink-0 overflow-hidden p-0 ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <Share2 className="h-4 w-4 text-violet-400" strokeWidth={1.75} />
        <h3 className="text-sm font-semibold text-white">Aperçu de partage (Open Graph)</h3>
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          type carte lien
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/50 shadow-xl shadow-black/20">
          {imgSrc && !imgError ? (
            <div className="relative aspect-[1.91/1] max-h-52 w-full bg-zinc-900 sm:max-h-60">
              {/* eslint-disable-next-line @next/next/no-img-element -- URL tierce dynamique, pas d'optimisation Next */}
              <img
                src={imgSrc}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="flex aspect-[1.91/1] max-h-40 items-center justify-center bg-gradient-to-br from-zinc-800/80 to-zinc-900 px-6 text-center sm:max-h-48">
              <p className="text-xs text-zinc-500">
                {imgSrc
                  ? "Image og:image non chargée (CORS, 404 ou format)."
                  : "Aucune og:image — ajoutez une image pour les réseaux sociaux."}
              </p>
            </div>
          )}
          <div className="space-y-1.5 border-t border-white/5 bg-zinc-900/80 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{hostname}</p>
            <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-cyan-100">
              {title}
            </p>
            {desc ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">{desc}</p>
            ) : (
              <p className="text-xs italic text-zinc-600">Pas d&apos;og:description</p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

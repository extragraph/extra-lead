"use client";

import { Globe, Loader2, ScanLine } from "lucide-react";
import { FormEvent, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";

type UrlScannerCardProps = {
  onScan: (url: string) => void | Promise<void>;
  loading?: boolean;
};

export function UrlScannerCard({ onScan, loading }: UrlScannerCardProps) {
  const [url, setUrl] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || loading) return;
    await onScan(trimmed);
  }

  return (
    <GlassCard variant="strong" className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <ScanLine className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Scanner un site</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Collez l’URL du site à auditer. Les scores Performance / SEO /
              Accessibilité viennent de PageSpeed Insights by Google.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <label className="relative flex min-h-[52px] flex-1 items-center">
            <span className="sr-only">URL du site à auditer</span>
            <Globe
              className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-500"
              strokeWidth={1.5}
            />
            <input
              type="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemple.fr"
              autoComplete="url"
              disabled={loading}
              className="h-full min-h-[52px] w-full rounded-xl border border-white/10 bg-zinc-950/60 py-3 pl-12 pr-4 text-[15px] text-white placeholder:text-zinc-600 outline-none ring-0 transition focus:border-cyan-500/40 focus:bg-zinc-950/80 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <ScanLine className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Analyse…" : "Lancer l’audit"}
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          Sans clé Google, les scores sont <strong className="font-medium text-zinc-400">simulés</strong>{" "}
          (déterministes par URL). Ajoutez <code className="rounded bg-zinc-800 px-1 py-0.5 text-[10px] text-zinc-300">GOOGLE_PAGESPEED_API_KEY</code> pour les mesures réelles.
        </p>
      </form>
    </GlassCard>
  );
}

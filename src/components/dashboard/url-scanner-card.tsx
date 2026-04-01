"use client";

import { Briefcase, Globe, Loader2, MapPin, ScanLine, ChevronDown, ChevronUp } from "lucide-react";
import { FormEvent, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";

export type UrlScanPayload = {
  url: string;
  city?: string;
  activity?: string;
};

type UrlScannerCardProps = {
  onScan: (payload: UrlScanPayload) => void | Promise<void>;
  loading?: boolean;
  hasPageSpeedKey?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
};

const inputClass =
  "h-full min-h-[52px] w-full rounded-xl border border-[var(--panel-border)] bg-[var(--input-bg)] py-3 text-[15px] text-foreground placeholder:text-muted outline-none ring-0 transition focus:border-cyan-500/40 focus:bg-[var(--input-bg)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] disabled:opacity-60";

export function UrlScannerCard({ onScan, loading, hasPageSpeedKey = false, expanded = true, onToggle }: UrlScannerCardProps) {
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
  const [activity, setActivity] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || loading) return;
    const payload: UrlScanPayload = { url: trimmed };
    const c = city.trim();
    const a = activity.trim();
    if (c) payload.city = c;
    if (a) payload.activity = a;
    await onScan(payload);
  }

  return (
    <GlassCard variant="strong" className={`transition-all duration-300 ${expanded ? 'p-6 sm:p-8' : 'p-4 sm:p-5'}`}>
      <div 
        className={`flex items-start justify-between ${onToggle ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={onToggle}
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <ScanLine className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className={`font-semibold text-foreground ${expanded ? 'text-lg' : 'text-base mt-2'}`}>
              Scanner un nouveau site
            </h2>
            {expanded && (
              <p className="mt-1 text-sm text-muted">
                Collez l’URL du site à auditer. Scores Performance, SEO et Accessibilité propulsés par PageSpeed.
              </p>
            )}
          </div>
        </div>
        
        {onToggle && (
           <button 
             type="button"
             className="ml-4 mt-2 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors" 
             aria-label={expanded ? "Replier" : "Déplier"}
           >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
           </button>
        )}
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="space-y-5 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <label className="relative flex min-h-[52px] w-full items-center">
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
            className={`${inputClass} pl-12 pr-4`}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="flex min-h-[52px] min-w-0 flex-1 flex-row gap-3">
            <label className="relative flex min-h-[52px] min-w-0 flex-1 items-center">
              <span className="sr-only">Ville (concurrence locale)</span>
              <MapPin
                className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-500"
                strokeWidth={1.5}
              />
              <input
                type="text"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ville (ex. Lyon)"
                autoComplete="address-level2"
                disabled={loading}
                className={`${inputClass} min-w-0 pl-12 pr-4`}
              />
            </label>
            <label className="relative flex min-h-[52px] min-w-0 flex-1 items-center">
              <span className="sr-only">Activité ou secteur</span>
              <Briefcase
                className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-500"
                strokeWidth={1.5}
              />
              <input
                type="text"
                name="activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Activité (ex. Plomberie)"
                autoComplete="off"
                disabled={loading}
                className={`${inputClass} min-w-0 pl-12 pr-4`}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[180px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <ScanLine className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Analyse…" : "Lancer l’audit"}
          </button>
        </div>

        <p className="text-xs text-muted">
          <strong className="font-medium text-foreground">Ville</strong> et <strong className="font-medium text-foreground">activité</strong> (optionnelles) affinent la recherche de concurrents locaux.
          {!hasPageSpeedKey && (
            <>
              {" "}
              Sans clé Google, les scores sont{" "}
              <strong className="font-medium text-foreground">simulés</strong> (déterministes par URL). Ajoutez{" "}
              <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 text-[10px] text-muted dark:text-zinc-300">
                GOOGLE_API_KEY
              </code>{" "}
              (ou{" "}
              <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 text-[10px] text-muted dark:text-zinc-300">
                GOOGLE_PAGESPEED_API_KEY
              </code>
              ) pour les mesures réelles.
            </>
          )}
        </p>
        </form>
      )}
    </GlassCard>
  );
}

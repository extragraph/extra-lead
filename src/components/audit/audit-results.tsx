"use client";

import type { AuditPayload } from "@/types/audit";
import { CircularGauge } from "@/components/audit/circular-gauge";
import { BlockingPointsPanel } from "@/components/audit/blocking-points-panel";
import { DesignChecklistPanel } from "@/components/audit/design-checklist-panel";
import { ExportAuditPdfButton } from "@/components/audit/export-audit-pdf-button";
import { OpleadSection } from "@/components/audit/oplead-section";
import { OpenGraphPreviewCard } from "@/components/audit/open-graph-preview-card";
import { GlobalScoreSummary } from "@/components/audit/global-score-summary";
import { LocalCompetitorsSection } from "@/components/audit/local-competitors-section";
import { SiteScreenshotCard } from "@/components/audit/site-screenshot-card";
import { GeoVisibilityPanel } from "@/components/audit/geo-visibility-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { buildImprovementSuggestions } from "@/lib/audit/improvement-suggestions";
import { AlertCircle } from "lucide-react";

function IntegrationHintsPanel({ hints }: { hints: string[] }) {
  if (hints.length === 0) return null;
  return (
    <div
      className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
      role="status"
    >
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} />
        <ul className="list-inside list-disc space-y-1.5 text-amber-100/95">
          {hints.map((h, i) => (
            <li key={i} className="leading-snug">
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SourceBadge({ payload }: { payload: AuditPayload }) {
  const { dataSource } = payload;
  if (dataSource === "pagespeed") {
    return (
      <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
        Données PageSpeed Insights (réelles)
      </span>
    );
  }
  if (dataSource === "pagespeed_partial") {
    return (
      <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
        PageSpeed indisponible — scores simulés
      </span>
    );
  }
  return (
    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
      Mode démo — scores simulés (ajoutez une clé API Google)
    </span>
  );
}

export function AuditResults({ payload }: { payload: AuditPayload }) {
  const improvementSuggestions = buildImprovementSuggestions(payload);
  const hasOg = payload.openGraph.present;
  const hasBlocking = payload.blockingPoints.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Résultats de l’audit</h2>
          <p className="mt-1 truncate text-sm text-zinc-500" title={payload.url}>
            {payload.url}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SourceBadge payload={payload} />
          <ExportAuditPdfButton audit={payload} />
        </div>
      </div>

      {payload.integrationHints && payload.integrationHints.length > 0 && (
        <IntegrationHintsPanel hints={payload.integrationHints} />
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <SiteScreenshotCard pageUrl={payload.url} />
        <div className="flex flex-col gap-6">
          <GlobalScoreSummary scores={payload.scores} suggestions={improvementSuggestions} />
          {hasOg ? <OpenGraphPreviewCard pageUrl={payload.url} og={payload.openGraph} /> : null}
        </div>
      </div>

      <GlassCard variant="strong" className="p-6 sm:p-8">
        <p className="mb-6 text-sm text-zinc-400">
          Jauges synthétiques — vert &gt; 75, orange 50–74, rouge &lt; 50.
        </p>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {payload.scores.map((s) => (
            <CircularGauge key={s.id} slice={s} />
          ))}
        </div>
      </GlassCard>

      <GeoVisibilityPanel geo={payload.geoVisibility} />

      {payload.competitiveComparison && (
        <LocalCompetitorsSection data={payload.competitiveComparison} />
      )}

      <section className="space-y-4" aria-labelledby="audit-details-heading">
        <h3
          id="audit-details-heading"
          className="text-lg font-semibold tracking-tight text-white"
        >
          Actions à mener
        </h3>
        
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-5">
          <div className="flex h-full min-h-[280px] min-w-0 lg:min-h-[360px]">
            <DesignChecklistPanel 
              checks={[
                ...payload.designChecks,
                {
                  id: "geo-ai-check",
                  label: "Optimisé pour l'IA",
                  detail: "Fichiers robots.txt autorisés et présence du standard llms.txt.",
                  ok: payload.geoVisibility ? (payload.geoVisibility.hasLlmsTxt && payload.geoVisibility.robotsTxtBlocksAI === false) : false
                }
              ]} 
              className="w-full" 
            />
          </div>
          <div className="flex h-full min-h-0 flex-col gap-6 lg:gap-5">
            <OpleadSection oplead={payload.oplead} />
            {hasBlocking ? (
              <BlockingPointsPanel points={payload.blockingPoints} className="min-h-0 flex-1" />
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-12 overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-indigo-500/10 p-8 sm:p-10 text-center shadow-[0_0_40px_rgba(34,211,238,0.1)] relative">
        <div className="absolute inset-0 bg-zinc-950/40 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
          <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Vous souhaitez <span className="text-cyan-400">mettre à jour</span> votre site internet ?
          </h3>
          <p className="max-w-xl text-[15px] leading-relaxed text-zinc-300">
            Une grande partie de ces optimisations est rapide à implémenter. Prenez une longueur d'avance et ne laissez plus vos concurrents capter vos leads.
          </p>
          <a
            href="https://extragraph.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-violet-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            Contactez-nous
          </a>
        </div>
      </div>
    </div>
  );
}

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
  const bentoRight = hasOg || hasBlocking;

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
        <GlobalScoreSummary scores={payload.scores} suggestions={improvementSuggestions} />
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

      {payload.competitiveComparison && (
        <LocalCompetitorsSection data={payload.competitiveComparison} />
      )}

      <OpleadSection oplead={payload.oplead} />

      <section className="space-y-4" aria-labelledby="audit-details-heading">
        <h3
          id="audit-details-heading"
          className="text-lg font-semibold tracking-tight text-white"
        >
          Détails
        </h3>
        {!bentoRight ? (
          <DesignChecklistPanel
            checks={payload.designChecks}
            className="min-h-[280px] lg:min-h-[360px]"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-5">
            <div className="flex h-full min-h-[280px] min-w-0 lg:min-h-[360px]">
              <DesignChecklistPanel checks={payload.designChecks} className="w-full" />
            </div>
            <div className="flex h-full min-h-0 flex-col gap-6 lg:gap-5">
              {hasOg ? (
                <OpenGraphPreviewCard pageUrl={payload.url} og={payload.openGraph} />
              ) : null}
              {hasBlocking ? (
                <BlockingPointsPanel points={payload.blockingPoints} className="min-h-0 flex-1" />
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

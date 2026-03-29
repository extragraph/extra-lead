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
import { getGlobalAverage, letterGradeFromAverage } from "@/lib/score-grade";

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
  const globalAvg = getGlobalAverage(payload.scores);
  const letter = letterGradeFromAverage(globalAvg);

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

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <SiteScreenshotCard
          pageUrl={payload.url}
          letter={letter}
          average={globalAvg}
        />
        <GlobalScoreSummary scores={payload.scores} />
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

      <div
        className={
          payload.blockingPoints.length > 0 ? "grid gap-6 lg:grid-cols-2" : "grid gap-6"
        }
      >
        <DesignChecklistPanel checks={payload.designChecks} />
        <BlockingPointsPanel points={payload.blockingPoints} />
      </div>

      <div className="space-y-8 border-t border-white/5 pt-8">
        <OpleadSection oplead={payload.oplead} />
        <OpenGraphPreviewCard pageUrl={payload.url} og={payload.openGraph} />
      </div>
    </div>
  );
}

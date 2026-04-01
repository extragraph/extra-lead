"use client";

import type { CompetitiveComparisonPayload, ComparisonTier } from "@/types/audit";
import { normalizeAuditUrl } from "@/lib/audit/url-allowlist";
import {
  pickWinningCompetitorId,
  prospectLossFlags,
  type MetricKey,
} from "@/lib/competitive-table-utils";
import { GlassCard } from "@/components/ui/glass-card";
import { AlertTriangle, ExternalLink, Trophy, Users } from "lucide-react";
import { useMemo } from "react";

function SiteUrlLink({ urlLabel }: { urlLabel: string }) {
  const href = normalizeAuditUrl(urlLabel);
  if (!href) {
    return (
      <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-500" title={urlLabel}>
        {urlLabel}
      </p>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-0.5 inline-flex max-w-full min-w-0 items-center gap-1 font-mono text-[11px] text-cyan-600 hover:underline"
      title={`${urlLabel} — ouvre dans un nouvel onglet`}
    >
      <span className="min-w-0 truncate">{urlLabel}</span>
      <ExternalLink className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
      <span className="sr-only">(nouvel onglet)</span>
    </a>
  );
}

function TierCell({
  tier,
  showWarning,
}: {
  tier: ComparisonTier;
  showWarning?: boolean;
}) {
  const ring =
    tier.level === "green"
      ? "bg-emerald-500 shadow-emerald-500/40"
      : tier.level === "orange"
        ? "bg-amber-500 shadow-amber-500/35"
        : "bg-rose-500 shadow-rose-500/40";

  return (
    <div className="flex items-start justify-center gap-1.5">
      <div className="flex w-5 shrink-0 justify-center pt-0.5" aria-hidden>
        {showWarning ? (
          <span title="En retard vs. la concurrence sur ce critère">
            <AlertTriangle className="h-4 w-4 text-amber-400" strokeWidth={2.25} />
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-2">
        <span
          className={`inline-block h-3 w-3 shrink-0 rounded-full shadow-lg ring-2 ring-white/20 ${ring}`}
          title={tier.label}
          aria-hidden
        />
        <span className="max-w-[120px] text-[11px] leading-snug text-muted sm:max-w-none sm:text-xs font-medium">
          {tier.label}
        </span>
      </div>
    </div>
  );
}

type Props = {
  data: CompetitiveComparisonPayload | undefined;
};

export function LocalCompetitorsSection({ data }: Props) {
  const winnerId = useMemo(
    () => (data?.rows?.length ? pickWinningCompetitorId(data.rows) : null),
    [data],
  );

  const loss = useMemo(() => {
    if (!data?.rows?.length) return null;
    const p = data.rows.find((r) => r.isProspect);
    const comps = data.rows.filter((r) => !r.isProspect);
    return prospectLossFlags(p, comps);
  }, [data]);

  if (!data?.rows?.length || !loss) {
    return null;
  }

  const cellWarning = (key: MetricKey, isProspect: boolean) =>
    isProspect && loss[key];

  return (
    <GlassCard variant="strong" className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
            <Users className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground">Vos concurrents locaux</h3>
            <p className="mt-1 text-sm text-muted">
              Secteur détecté :{" "}
              <span className="font-medium text-foreground">{data.sectorLabel}</span> —{" "}
              <span className="font-medium text-foreground">{data.cityLabel}</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed font-semibold text-amber-900 border-l-2 border-amber-300 pl-3 py-1.5 bg-amber-50/70 rounded-r-md">
              {data.disclaimer}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/80">
              <th className="sticky left-0 z-10 min-w-[200px] bg-[var(--panel-bg)] px-4 py-3 pl-5 text-xs font-semibold uppercase tracking-wider text-muted">
                Site
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                Vitesse
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                Design
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                Conversion
              </th>
              <th className="px-3 py-3 pr-5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                Mobile
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const isWinner = !row.isProspect && winnerId === row.id;
              return (
                <tr
                  key={row.id}
                  className={`border-b border-white/5 transition hover:bg-white/[0.02] ${
                    row.isProspect ? "bg-cyan-500/[0.04]" : ""
                  } ${isWinner ? "bg-amber-500/[0.06]" : ""}`}
                >
                  <td
                    className={`sticky left-0 z-10 max-w-[240px] px-4 py-4 pl-5 ${
                      row.isProspect
                        ? "border-l-2 border-l-cyan-500/60 bg-[var(--panel-bg)]"
                        : isWinner
                          ? "border-l-2 border-l-amber-400/50 bg-[var(--panel-bg)]"
                          : "bg-[var(--panel-bg)]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isWinner && (
                        <span
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 shadow-sm"
                          title="Meilleur profil simulé sur ce benchmark"
                        >
                          <Trophy className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-semibold ${row.isProspect ? "text-cyan-800" : "text-zinc-900"}`}
                        >
                          {row.name}
                        </p>
                        <SiteUrlLink urlLabel={row.urlLabel} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 align-middle">
                    <TierCell
                      tier={row.performance}
                      showWarning={cellWarning("performance", row.isProspect)}
                    />
                  </td>
                  <td className="px-3 py-4 align-middle">
                    <TierCell
                      tier={row.design}
                      showWarning={cellWarning("design", row.isProspect)}
                    />
                  </td>
                  <td className="px-3 py-4 align-middle">
                    <TierCell
                      tier={row.conversion}
                      showWarning={cellWarning("conversion", row.isProspect)}
                    />
                  </td>
                  <td className="px-3 py-4 pr-5 align-middle">
                    <TierCell
                      tier={row.mobile}
                      showWarning={cellWarning("mobile", row.isProspect)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[var(--panel-border)] bg-[var(--panel-bg)] px-5 py-6 sm:px-6">
        <p className="mb-4 text-center text-sm text-muted">
          Voulez-vous un audit réel de vos concurrents ?
        </p>
        <a
          href="https://extragraph.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-violet-600 px-6 py-4 text-center text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        >
          Prendre rendez-vous
        </a>
      </div>
    </GlassCard>
  );
}

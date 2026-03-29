import type { ComparisonTierLevel, CompetitorComparisonRow } from "@/types/audit";

const METRICS = ["performance", "design", "conversion", "mobile"] as const;

export type MetricKey = (typeof METRICS)[number];

export function tierNumeric(level: ComparisonTierLevel): number {
  if (level === "green") return 3;
  if (level === "orange") return 2;
  return 1;
}

/** Concurrent avec le meilleur total (somme des 4 critères). */
export function pickWinningCompetitorId(rows: CompetitorComparisonRow[]): string | null {
  const competitors = rows.filter((r) => !r.isProspect);
  if (competitors.length === 0) return null;

  let best = competitors[0];
  let bestSum = -1;

  for (const c of competitors) {
    const sum = METRICS.reduce(
      (acc, m) => acc + tierNumeric(c[m].level),
      0,
    );
    if (sum > bestSum) {
      bestSum = sum;
      best = c;
    }
  }
  return best.id;
}

/** Sur chaque critère : le prospect est derrière au moins un concurrent ? */
export function prospectLossFlags(
  prospect: CompetitorComparisonRow | undefined,
  competitors: CompetitorComparisonRow[],
): Record<MetricKey, boolean> {
  const empty = {
    performance: false,
    design: false,
    conversion: false,
    mobile: false,
  };
  if (!prospect) return empty;

  const out = { ...empty };
  for (const m of METRICS) {
    const pv = tierNumeric(prospect[m].level);
    out[m] = competitors.some((c) => tierNumeric(c[m].level) > pv);
  }
  return out;
}

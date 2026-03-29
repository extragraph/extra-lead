import type { AuditScoreSlice } from "@/types/audit";

const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export type PageSpeedResult =
  | {
      ok: true;
      scores: AuditScoreSlice[];
      viewportScore: number | null;
    }
  | { ok: false; error: string };

function categoryScore(
  categories: Record<string, { score: number | null } | undefined>,
  key: string,
): number | null {
  const s = categories[key]?.score;
  if (s == null || Number.isNaN(s)) return null;
  return Math.round(s * 100);
}

export async function fetchPageSpeedScores(
  url: string,
  apiKey: string,
): Promise<PageSpeedResult> {
  const params = new URLSearchParams({
    url,
    key: apiKey,
    strategy: "mobile",
  });
  params.append("category", "PERFORMANCE");
  params.append("category", "SEO");
  params.append("category", "ACCESSIBILITY");

  const res = await fetch(`${PSI_BASE}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { ok: false, error: `PageSpeed HTTP ${res.status}` };
  }

  const json = (await res.json()) as {
    lighthouseResult?: {
      categories?: Record<string, { score: number | null }>;
      audits?: Record<string, { score: number | null }>;
    };
    error?: { message: string };
  };

  if (json.error?.message) {
    return { ok: false, error: json.error.message };
  }

  const lh = json.lighthouseResult;
  if (!lh?.categories) {
    return { ok: false, error: "Réponse PageSpeed invalide" };
  }

  const cat = lh.categories;
  const perf = categoryScore(cat, "performance");
  const seo = categoryScore(cat, "seo");
  const a11y = categoryScore(cat, "accessibility");

  const viewportAudit = lh.audits?.viewport;
  const viewportScore =
    viewportAudit?.score != null ? Math.round(viewportAudit.score * 100) : null;

  const scores: AuditScoreSlice[] = [
    {
      id: "performance",
      label: "Performance",
      score: perf ?? 0,
    },
    {
      id: "seo",
      label: "SEO",
      score: seo ?? 0,
    },
    {
      id: "accessibility",
      label: "Accessibilité",
      score: a11y ?? 0,
    },
  ];

  return { ok: true, scores, viewportScore };
}

export function mergeWithDesignScore(
  scores: AuditScoreSlice[],
  designScore: number,
): AuditScoreSlice[] {
  const withoutDesign = scores.filter((s) => s.id !== "design");
  return [
    ...withoutDesign,
    { id: "design", label: "Design & UX", score: designScore },
  ];
}

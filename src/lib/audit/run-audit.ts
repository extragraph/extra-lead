import type { AuditDataSource, AuditPayload, AuditScoreSlice } from "@/types/audit";
import { analyzeDesignFromHtml } from "./design-checks";
import { detectBasicContactForm } from "./form-detection";
import { fetchPageHtml } from "./html-fetch";
import { buildOpleadBlock } from "./oplead";
import { fetchPageSpeedScores, mergeWithDesignScore } from "./pagespeed";
import { simulateBasicFormFallback, simulatePageSpeedScores } from "./simulate";
import { normalizeAuditUrl } from "./url-allowlist";

function blockingFromScoresAndDesign(
  scores: { id: string; score: number }[],
  failedLabels: string[],
): string[] {
  const out: string[] = [];
  for (const s of scores) {
    if (s.score < 50) {
      out.push(`Score « ${s.id} » sous les 50/100 — à prioriser.`);
    }
  }
  out.push(...failedLabels);
  return [...new Set(out)].slice(0, 12);
}

export async function runAudit(rawUrl: string): Promise<
  | { ok: true; payload: AuditPayload }
  | { ok: false; status: number; message: string }
> {
  const url = normalizeAuditUrl(rawUrl);
  if (!url) {
    return { ok: false, status: 400, message: "URL invalide ou non autorisée." };
  }

  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY?.trim();

  const [html, psi] = await Promise.all([
    fetchPageHtml(url),
    apiKey ? fetchPageSpeedScores(url, apiKey) : Promise.resolve({ ok: false as const, error: "no-key" }),
  ]);

  const viewportOk =
    psi.ok && psi.viewportScore != null ? psi.viewportScore >= 90 : undefined;

  const design = analyzeDesignFromHtml(url, html, viewportOk);

  let dataSource: AuditDataSource;
  let scores: AuditScoreSlice[];

  if (apiKey && psi.ok) {
    dataSource = "pagespeed";
    scores = mergeWithDesignScore(psi.scores, design.designScore);
  } else {
    dataSource = apiKey ? "pagespeed_partial" : "simulated";
    const sim = simulatePageSpeedScores(url);
    scores = sim.scores.map((s) =>
      s.id === "design" ? { ...s, score: design.designScore } : s,
    );
  }

  let basicForm = false;
  let detectedFromHtml = false;
  if (html) {
    basicForm = detectBasicContactForm(html);
    detectedFromHtml = basicForm;
  } else {
    basicForm = simulateBasicFormFallback(url);
    detectedFromHtml = false;
  }

  const blocking = blockingFromScoresAndDesign(
    scores,
    design.checks.filter((c) => !c.ok).map((c) => c.detail || c.label),
  );

  const payload: AuditPayload = {
    url,
    auditedAt: new Date().toISOString(),
    dataSource,
    scores,
    designChecks: design.checks,
    openGraph: design.openGraph,
    blockingPoints: blocking,
    oplead: buildOpleadBlock(basicForm, detectedFromHtml),
  };

  return { ok: true, payload };
}

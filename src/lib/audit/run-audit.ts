import type { AuditDataSource, AuditLocalContext, AuditPayload, AuditScoreSlice } from "@/types/audit";
import { buildCompetitiveSimulation } from "./competitive-simulation";
import { tryBuildCompetitiveFromPlaces } from "./places-competitive";
import { analyzeDesignFromHtml } from "./design-checks";
import { detectBasicContactForm } from "./form-detection";
import { fetchPageHtml } from "./html-fetch";
import { buildOpleadBlock } from "./oplead";
import { fetchPageSpeedScores, mergeWithDesignScore } from "./pagespeed";
import { simulateBasicFormFallback, simulatePageSpeedScores } from "./simulate";
import { getGooglePageSpeedKey, getGooglePlacesKey } from "@/lib/env/google-api-keys";
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

function normalizeLocalContext(raw: AuditLocalContext | null | undefined): AuditLocalContext | undefined {
  if (!raw) return undefined;
  const city = raw.city?.trim();
  const activity = raw.activity?.trim();
  if (!city && !activity) return undefined;
  return { ...(city ? { city } : {}), ...(activity ? { activity } : {}) };
}

export async function runAudit(
  rawUrl: string,
  localContext?: AuditLocalContext | null,
): Promise<
  | { ok: true; payload: AuditPayload }
  | { ok: false; status: number; message: string }
> {
  const local = normalizeLocalContext(localContext);
  const url = normalizeAuditUrl(rawUrl);
  if (!url) {
    return { ok: false, status: 400, message: "URL invalide ou non autorisée." };
  }

  const apiKey = getGooglePageSpeedKey();

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

  const placesKey = getGooglePlacesKey();

  let competitiveComparison = placesKey
    ? await tryBuildCompetitiveFromPlaces({
        prospectUrl: url,
        html,
        scores,
        designChecks: design.checks,
        basicFormPitch: basicForm,
        pageSpeedKey: apiKey,
        placesKey,
        local,
      })
    : null;

  if (!competitiveComparison) {
    competitiveComparison = buildCompetitiveSimulation(
      url,
      html,
      scores,
      design.checks,
      basicForm,
      local,
    );
  }

  const payload: AuditPayload = {
    url,
    auditedAt: new Date().toISOString(),
    dataSource,
    scores,
    designChecks: design.checks,
    openGraph: design.openGraph,
    competitiveComparison,
    blockingPoints: blocking,
    oplead: buildOpleadBlock(basicForm, detectedFromHtml),
  };

  return { ok: true, payload };
}

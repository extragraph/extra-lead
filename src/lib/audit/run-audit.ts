import type {
  AuditDataSource,
  AuditLocalContext,
  AuditPayload,
  AuditScoreSlice,
  CompetitiveComparisonPayload,
} from "@/types/audit";
import { buildCompetitiveSimulation } from "./competitive-simulation";
import { tryBuildCompetitiveFromPlaces } from "./places-competitive";
import { analyzeDesignFromHtml } from "./design-checks";
import { detectBasicContactForm } from "./form-detection";
import { fetchPageHtml } from "./html-fetch";
import { buildOpleadBlock } from "./oplead";
import { getGooglePageSpeedKey, getGooglePlacesKey } from "@/lib/env/google-api-keys";
import { fetchPageSpeedScores, mergeWithDesignScore } from "./pagespeed";
import { simulateBasicFormFallback, simulatePageSpeedScores } from "./simulate";
import { normalizeAuditUrl } from "./url-allowlist";
import { checkGeoVisibility } from "./geo-checks";

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

  const [html, psi, geoVisibility] = await Promise.all([
    fetchPageHtml(url),
    apiKey ? fetchPageSpeedScores(url, apiKey) : Promise.resolve({ ok: false as const, error: "no-key" }),
    checkGeoVisibility(url),
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

  const integrationHints: string[] = [];

  if (!apiKey) {
    integrationHints.push(
      "Aucune clé Google côté serveur : ajoutez GOOGLE_API_KEY (recommandé) ou GOOGLE_PAGESPEED_API_KEY dans les variables d’environnement du déploiement (ex. Vercel), puis redéployez.",
    );
  } else if (!psi.ok) {
    integrationHints.push(`PageSpeed : ${psi.error}`);
    integrationHints.push(
      "Vérifiez que l’API « PageSpeed Insights API » est activée sur le projet Google Cloud, et que la clé n’est pas restreinte aux seuls référents HTTP navigateur (incompatible avec les appels serveur Vercel).",
    );
  }

  let competitiveComparison: CompetitiveComparisonPayload | undefined;
  if (placesKey) {
    const pr = await tryBuildCompetitiveFromPlaces({
      prospectUrl: url,
      html,
      scores,
      designChecks: design.checks,
      basicFormPitch: basicForm,
      pageSpeedKey: apiKey,
      placesKey,
      local,
    });
    if (pr.ok) {
      competitiveComparison = pr.payload;
    } else {
      integrationHints.push(`Concurrents (Places) : ${pr.reason}`);
      integrationHints.push(
        "Activez « Places API (New) » sur le même projet GCP (facturation). Évitez la restriction de clé « Référents HTTP » pour les appels backend.",
      );
    }
  }

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
    geoVisibility,
    competitiveComparison,
    blockingPoints: blocking,
    oplead: buildOpleadBlock(basicForm, detectedFromHtml, local?.activity),
    ...(integrationHints.length > 0 ? { integrationHints } : {}),
  };

  return { ok: true, payload };
}

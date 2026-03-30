import type {
  AuditDataSource,
  AuditLocalContext,
  AuditPayload,
  AuditScoreSlice,
  CompetitiveComparisonPayload,
} from "@/types/audit";
import {
  buildCompetitiveSimulation,
  buildProspectComparisonRow,
} from "./competitive-simulation";
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
import { captureScreenshot } from "../screenshot/capture-utils";
import { estimateDesignAge } from "./design-age";

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
  const placesKey = getGooglePlacesKey();

  // 1. On lance les tâches qui peuvent démarrer immédiatement
  const htmlPromise = fetchPageHtml(url);
  const psiPromise = apiKey 
    ? fetchPageSpeedScores(url, apiKey) 
    : Promise.resolve({ ok: false as const, error: "no-key" });
  const geoVisibilityPromise = checkGeoVisibility(url);

  // 2. Dès que le HTML est là, on lance l'analyse de design et la recherche compétitive
  const html = await htmlPromise;
  
  // Analyse de design locale (synchrone/rapide si on a le HTML)
  // On ne peut pas savoir si viewport est Ok sans PSI, donc on passera undefined au début
  const designBaseline = analyzeDesignFromHtml(url, html, undefined);
  const basicForm = html ? detectBasicContactForm(html) : simulateBasicFormFallback(url);
  const detectedFromHtml = html ? basicForm : false;

  // LANCEMENT COMPÉTITIF DÈS QUE POSSIBLE
  // Il ne dépend pas des scores PSI du prospect pour chercher les concurrents !
  const competitivePromise = (async () => {
    if (!placesKey) return undefined;
    
    const pr = await tryBuildCompetitiveFromPlaces({
      prospectUrl: url,
      html,
      // On passera des scores partiels ou simulés temporairement si besoin, 
      // mais en réalité tryBuildCompetitiveFromPlaces n'en a besoin que pour la ligne prospect
      scores: [], // On complétera après
      designChecks: designBaseline.checks,
      basicFormPitch: basicForm,
      pageSpeedKey: apiKey,
      placesKey,
      local,
    });
    return pr.ok ? pr.payload : undefined;
  })();

  // 3. On attend le reste
  const [psi, geoVisibility, competitiveResult] = await Promise.all([
    psiPromise,
    geoVisibilityPromise,
    competitivePromise,
  ]);

  const viewportOk = psi.ok && psi.viewportScore != null ? psi.viewportScore >= 90 : undefined;
  // Ré-analyse fine si le viewport PSI a changé la donne (rarement impactant sur les chèques mais plus propre)
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

  const blocking = blockingFromScoresAndDesign(
    scores,
    design.checks.filter((c) => !c.ok).map((c) => c.detail || c.label),
  );

  const designAge = estimateDesignAge(html);
  if (designAge && designAge.ageYears >= 3) {
    const urgency = designAge.ageYears >= 5
      ? `Design obsolète (${designAge.estimatedYear}, soit ${designAge.ageYears} ans) — actualisation prioritaire du design et de l'expérience utilisateur.`
      : `Design vieillissant (${designAge.estimatedYear}, soit ${designAge.ageYears} ans) — une actualisation du design améliorera votre image et vos conversions.`;
    blocking.unshift(urgency);
  }

  const integrationHints: string[] = [];

  if (!apiKey) {
    integrationHints.push("Aucune clé Google côté serveur (PageSpeed).");
  } else if (!psi.ok) {
    integrationHints.push(`PageSpeed : ${psi.error}`);
  }

  // Finalisation du bloc compétitif (injection des scores réels du prospect)
  let competitiveComparison = competitiveResult;
  if (competitiveComparison) {
    const prospectRow = competitiveComparison.rows.find(r => r.isProspect);
    if (prospectRow) {
      // On met à jour la ligne prospect avec les scores finaux (en cas de delta suite au PSI)
      const updatedProspect = buildProspectComparisonRow(url, scores, design.checks, basicForm);
      competitiveComparison.rows = [updatedProspect, ...competitiveComparison.rows.filter(r => !r.isProspect)];
    }
  } else {
    // Si pas de Places, on fait la simulation
    competitiveComparison = buildCompetitiveSimulation(url, html, scores, design.checks, basicForm, local);
  }

  const payload: AuditPayload = {
    url,
    auditedAt: new Date().toISOString(),
    dataSource,
    scores,
    designChecks: design.checks,
    openGraph: design.openGraph,
    geoVisibility,
    designAge: designAge ?? undefined,
    competitiveComparison,
    blockingPoints: blocking,
    oplead: buildOpleadBlock(basicForm, detectedFromHtml, local?.activity),
    ...(integrationHints.length > 0 ? { integrationHints } : {}),
  };

  return { ok: true, payload };
}

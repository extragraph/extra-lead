import type {
  AuditLocalContext,
  AuditScoreSlice,
  CompetitiveComparisonPayload,
  CompetitorComparisonRow,
  ComparisonTier,
  DesignCheckItem,
} from "@/types/audit";
import {
  applyPenalty,
  buildPlacesTextQuery,
  buildProspectComparisonRow,
  detectCity,
  detectSector,
  tierFromScore,
} from "./competitive-simulation";
import { analyzeDesignFromHtml } from "./design-checks";
import { detectBasicContactForm } from "./form-detection";
import { fetchPageHtml } from "./html-fetch";
import { hashString } from "./hash";
import { fetchPageSpeedScores, mergeWithDesignScore } from "./pagespeed";
import { searchTextPlaces } from "./places-search";
import { simulatePageSpeedScores } from "./simulate";
import { normalizeAuditUrl } from "./url-allowlist";

/** Limite les audits concurrents pour rester dans les timeouts serverless. */
const MAX_PLACES_COMPETITORS = 3;

function hostKey(u: string): string | null {
  try {
    return new URL(u).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

async function auditCompetitorPlace(
  hit: { id: string; name: string; website: string },
  pageSpeedKey: string | undefined,
): Promise<CompetitorComparisonRow | null> {
  const normalized = normalizeAuditUrl(hit.website);
  if (!normalized) return null;

  const [html, psi] = await Promise.all([
    fetchPageHtml(normalized),
    pageSpeedKey
      ? fetchPageSpeedScores(normalized, pageSpeedKey)
      : Promise.resolve({ ok: false as const, error: "no-key" }),
  ]);

  const viewportOk =
    psi.ok && psi.viewportScore != null ? psi.viewportScore >= 90 : undefined;

  const design = analyzeDesignFromHtml(normalized, html, viewportOk);

  let scores: AuditScoreSlice[];
  if (pageSpeedKey && psi.ok) {
    scores = mergeWithDesignScore(psi.scores, design.designScore);
  } else {
    const sim = simulatePageSpeedScores(normalized);
    scores = sim.scores.map((s) =>
      s.id === "design" ? { ...s, score: design.designScore } : s,
    );
  }

  let basicForm = false;
  if (html) {
    basicForm = detectBasicContactForm(html);
  }

  const perf = scores.find((s) => s.id === "performance")?.score ?? 0;
  const designScore = scores.find((s) => s.id === "design")?.score ?? 0;
  const responsiveOk = design.checks.find((c) => c.id === "responsive")?.ok ?? false;

  let conversion: ComparisonTier;
  if (basicForm) {
    conversion = {
      level: "red",
      label: "Formulaire basique — pas de CRM / OPLead",
    };
  } else {
    conversion = {
      level: "orange",
      label: "Formulaire présent — flux à industrialiser",
    };
  }

  const mobile = responsiveOk
    ? ({ level: "green" as const, label: "Site responsive" } satisfies ComparisonTier)
    : ({ level: "orange" as const, label: "Mobile perfectible" } satisfies ComparisonTier);

  const urlLabel =
    hostKey(normalized)?.replace(/^www\./, "") ||
    hit.website.replace(/^https?:\/\//i, "").replace(/\/$/, "");

  return {
    id: `place-${hashString(hit.website + hit.id).toString(16).slice(0, 14)}`,
    name: hit.name,
    urlLabel,
    isProspect: false,
    performance: tierFromScore(perf, {
      g: "Performant",
      o: "Moyen",
      r: "Faible",
    }),
    design: tierFromScore(designScore, {
      g: "Sobre & pro",
      o: "Standard",
      r: "Daté",
    }),
    conversion,
    mobile,
  };
}

export type PlacesCompetitiveResult =
  | { ok: true; payload: CompetitiveComparisonPayload }
  | { ok: false; reason: string };

/**
 * Concurrents réels via Places (recherche texte) + audit des sites trouvés.
 */
export async function tryBuildCompetitiveFromPlaces(input: {
  prospectUrl: string;
  html: string | null;
  scores: AuditScoreSlice[];
  designChecks: DesignCheckItem[];
  basicFormPitch: boolean;
  pageSpeedKey: string | undefined;
  placesKey: string;
  local?: AuditLocalContext | null;
}): Promise<PlacesCompetitiveResult> {
  const seed = hashString(input.prospectUrl);
  const city = input.local?.city?.trim() || detectCity(input.html, seed);
  const sector = input.local?.activity?.trim() || detectSector(input.html, input.prospectUrl, seed);
  const textQuery = buildPlacesTextQuery(input.prospectUrl, input.html, seed, input.local);

  const hits = await searchTextPlaces(input.placesKey, textQuery, 20);
  if ("error" in hits) {
    console.error("[places] searchTextPlaces:", hits.error);
    return { ok: false, reason: hits.error };
  }

  const prospectHost = hostKey(input.prospectUrl);
  if (!prospectHost) {
    return { ok: false, reason: "URL prospect invalide pour filtrer les domaines." };
  }

  const candidates = hits.filter((h) => {
    const n = normalizeAuditUrl(h.website);
    if (!n) return false;
    const hst = hostKey(n);
    return hst && hst !== prospectHost;
  });

  const rows: CompetitorComparisonRow[] = [];
  for (const hit of candidates) {
    if (rows.length >= MAX_PLACES_COMPETITORS) break;
    const row = await auditCompetitorPlace(hit, input.pageSpeedKey);
    if (row) rows.push(row);
  }

  if (rows.length === 0) {
    const nHits = hits.length;
    const nCand = candidates.length;
    const reason =
      nHits === 0
        ? `Aucun résultat Places pour « ${textQuery} » (affinez ville + activité).`
        : nCand === 0
          ? "Places a renvoyé des fiches sans site web public, ou seulement le domaine du prospect."
          : "Aucun site concurrent n’a pu être audité (chargement / URL invalides).";
    console.warn("[places]", reason, { textQuery, nHits, nCand });
    return { ok: false, reason };
  }

  const prospect = buildProspectComparisonRow(
    input.prospectUrl,
    input.scores,
    input.designChecks,
    input.basicFormPitch,
  );

  applyPenalty(prospect, rows, { places: true });

  return {
    ok: true,
    payload: {
      sectorLabel: sector,
      cityLabel: city,
      disclaimer:
        "Concurrents proposés via Google Places (recherche texte) — scores calculés sur l’audit automatique de chaque site public.",
      rows: [prospect, ...rows],
    },
  };
}

/** Types partagés pour les audits — PageSpeed, checks UX & OPLead. */

/** Contexte local optionnel (formulaire) — affine Places et les libellés concurrents. */
export interface AuditLocalContext {
  city?: string;
  activity?: string;
}

export type AuditCategoryId = "performance" | "seo" | "accessibility" | "design";

export type AuditDataSource = "pagespeed" | "simulated" | "pagespeed_partial";

export interface AuditScoreSlice {
  id: AuditCategoryId;
  label: string;
  score: number;
}

export interface DesignCheckItem {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
}

export interface OpenGraphPreview {
  present: boolean;
  title?: string;
  description?: string;
  imageUrl?: string | null;
}

export interface GeoVisibility {
  hasLlmsTxt: boolean;
  robotsTxtBlocksAI: boolean | null;
}

export type ComparisonTierLevel = "green" | "orange" | "red";

export interface ComparisonTier {
  level: ComparisonTierLevel;
  label: string;
}

export interface CompetitorComparisonRow {
  id: string;
  name: string;
  urlLabel: string;
  isProspect: boolean;
  performance: ComparisonTier;
  design: ComparisonTier;
  conversion: ComparisonTier;
  mobile: ComparisonTier;
}

export interface CompetitiveComparisonPayload {
  sectorLabel: string;
  cityLabel: string;
  disclaimer: string;
  rows: CompetitorComparisonRow[];
}

export interface AuditPayload {
  url: string;
  auditedAt: string;
  dataSource: AuditDataSource;
  scores: AuditScoreSlice[];
  designChecks: DesignCheckItem[];
  /** Aperçu partage social — renseigné si le HTML a été chargé */
  openGraph: OpenGraphPreview;
  /** Etat de visibilité pour les IAs (GEO) */
  geoVisibility?: GeoVisibility;
  /** Comparaison concurrentielle (Google Places + audit ou simulation si pas de clé) */
  competitiveComparison?: CompetitiveComparisonPayload;
  blockingPoints: string[];
  oplead: {
    headline: string;
    body: string;
    /** Message d’alerte CRM (formulaire basique détecté ou heuristique) */
    basicFormPitch: boolean;
    /** true si le formulaire basique a été vu dans le HTML (pas l’heuristique de secours) */
    detectedFromHtml: boolean;
  };
  /**
   * Indices si scores simulés ou concurrents simulés malgré une clé attendue
   * (clé absente sur le serveur, API désactivée, restriction référents, etc.).
   */
  integrationHints?: string[];
}

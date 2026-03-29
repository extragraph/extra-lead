/** Types partagés pour les audits — PageSpeed, checks UX & OPLead. */

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

export interface AuditPayload {
  url: string;
  auditedAt: string;
  dataSource: AuditDataSource;
  scores: AuditScoreSlice[];
  designChecks: DesignCheckItem[];
  /** Aperçu partage social — renseigné si le HTML a été chargé */
  openGraph: OpenGraphPreview;
  blockingPoints: string[];
  oplead: {
    headline: string;
    body: string;
    /** Message d’alerte CRM (formulaire basique détecté ou heuristique) */
    basicFormPitch: boolean;
    /** true si le formulaire basique a été vu dans le HTML (pas l’heuristique de secours) */
    detectedFromHtml: boolean;
  };
}

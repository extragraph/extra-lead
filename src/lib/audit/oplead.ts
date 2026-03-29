import type { AuditPayload } from "@/types/audit";

const BTP_KEYWORDS = [
  "plombier", "maçon", "électricien", "menuisier", "menuiserie", "peintre",
  "chauffagiste", "toiture", "couvreur", "charpentier", "btp",
  "rénovation", "construction", "artisan", "isolation", "énergétique"
];

function isBtpActivity(activity?: string): boolean {
  if (!activity) return false;
  const lower = activity.toLowerCase();
  return BTP_KEYWORDS.some(kw => lower.includes(kw));
}

export function buildOpleadBlock(
  basicForm: boolean,
  detectedFromHtml: boolean,
  activity?: string,
): AuditPayload["oplead"] {
  const isBtp = isBtpActivity(activity);

  const headline = isBtp ? "Opportunité OPLead spécialisée" : "Opportunité CRM et Conversion";

  let body = "";
  if (isBtp) {
    body = basicForm
      ? "⚠️ Manque de synchronisation métier : vos demandes de devis ne sont pas qualifiées pour votre secteur. Découvrez OPLead, le CRM conçu pour les artisans du bâtiment (BTP), afin d'automatiser vos relances chantiers."
      : "Centralisez vos demandes et devis avec OPLead, la solution spécialisée pour les artisans du BTP : pilotage des chantiers et relances commerciales automatiques.";
  } else {
    body = basicForm
      ? "⚠️ Formulaire basique détecté : vos leads ne sont probablement pas envoyés automatiquement vers un outil de suivi (CRM). Vous perdez inévitablement des opportunités de relance."
      : "Pilotez votre portefeuille client plus efficacement : la mise en place d'un outil CRM connecté à votre site web permettrait d'augmenter votre taux de conversion.";
  }

  return {
    headline,
    body,
    basicFormPitch: basicForm,
    detectedFromHtml,
  };
}

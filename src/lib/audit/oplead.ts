import type { AuditPayload } from "@/types/audit";

export const OPLEAD_HEADLINE = "Opportunité OPLead";

/** Message renforcé lorsque le formulaire est jugé basique (ou via heuristique de secours). */
export const OPLEAD_BASIC_FORM_BODY =
  "⚠️ Manque de synchronisation CRM : vos leads ne sont pas envoyés automatiquement vers OPLead";

/** Argument commercial affiché pour tous les autres audits. */
export const OPLEAD_STANDARD_BODY =
  "Centralisez vos demandes et pilotez votre prospection avec OPLead : synchronisation CRM, suivi des leads et conversion au sein de l’écosystème Extragraph.";

export function buildOpleadBlock(
  basicForm: boolean,
  detectedFromHtml: boolean,
): AuditPayload["oplead"] {
  return {
    headline: OPLEAD_HEADLINE,
    body: basicForm ? OPLEAD_BASIC_FORM_BODY : OPLEAD_STANDARD_BODY,
    basicFormPitch: basicForm,
    detectedFromHtml,
  };
}

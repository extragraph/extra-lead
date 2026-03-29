import type { AuditPayload } from "@/types/audit";

/**
 * Liste courte pour la colonne « score global » — priorité aux points bloquants,
 * sinon scores & checks à améliorer.
 */
export function buildImprovementSuggestions(payload: AuditPayload): string[] {
  if (payload.blockingPoints.length > 0) {
    return payload.blockingPoints.slice(0, 8);
  }

  const out: string[] = [];
  for (const s of payload.scores) {
    if (s.score < 75) {
      out.push(`Renforcer ${s.label.toLowerCase()} (${s.score}/100) — viser au moins 75/100.`);
    }
  }
  for (const c of payload.designChecks) {
    if (!c.ok && out.length < 8) {
      out.push(c.detail ? `${c.label} — ${c.detail}` : `À traiter : ${c.label}`);
    }
  }
  return out.slice(0, 8);
}

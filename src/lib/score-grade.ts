import type { AuditCategoryId, AuditScoreSlice } from "@/types/audit";

/**
 * Pondération du score global : la performance (Core Web Vitals) et le SEO
 * pèsent davantage, aligné avec l’impact attendu sur le référencement.
 * Somme = 1.
 */
export const GLOBAL_SCORE_WEIGHTS: Record<AuditCategoryId, number> = {
  performance: 0.4,
  seo: 0.28,
  accessibility: 0.16,
  design: 0.16,
};

/** Moyenne pondérée des scores catégories (0–100). */
export function getGlobalAverage(scores: AuditScoreSlice[]): number {
  if (scores.length === 0) return 0;
  let acc = 0;
  let wSum = 0;
  for (const s of scores) {
    const w = GLOBAL_SCORE_WEIGHTS[s.id];
    if (w != null) {
      acc += s.score * w;
      wSum += w;
    }
  }
  if (wSum === 0) {
    const sum = scores.reduce((a, x) => a + x.score, 0);
    return Math.round(sum / scores.length);
  }
  return Math.round(acc / wSum);
}

/** Lettre A–E pour la synthèse globale. */
export function letterGradeFromAverage(avg: number): string {
  if (avg >= 90) return "A";
  if (avg >= 75) return "B";
  if (avg >= 60) return "C";
  if (avg >= 45) return "D";
  return "E";
}

export type GradeTone = "green" | "lime" | "amber" | "orange" | "red";

export function gradeTone(letter: string): GradeTone {
  switch (letter) {
    case "A":
      return "green";
    case "B":
      return "lime";
    case "C":
      return "amber";
    case "D":
      return "orange";
    default:
      return "red";
  }
}

export function gradeBadgeClass(tone: GradeTone): string {
  switch (tone) {
    case "green":
      return "border-emerald-400/40 bg-emerald-500/90 text-white shadow-emerald-500/30";
    case "lime":
      return "border-lime-400/40 bg-lime-500/90 text-zinc-900 shadow-lime-500/25";
    case "amber":
      return "border-amber-400/40 bg-amber-500/90 text-zinc-900 shadow-amber-500/25";
    case "orange":
      return "border-orange-400/40 bg-orange-500/90 text-white shadow-orange-500/30";
    default:
      return "border-rose-400/40 bg-rose-600/95 text-white shadow-rose-500/35";
  }
}

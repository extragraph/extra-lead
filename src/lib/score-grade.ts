import type { AuditScoreSlice } from "@/types/audit";

/** Moyenne arithmétique des scores catégories (0–100). */
export function getGlobalAverage(scores: AuditScoreSlice[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s.score, 0);
  return Math.round(sum / scores.length);
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

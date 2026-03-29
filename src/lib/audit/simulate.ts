import type { AuditDataSource, AuditScoreSlice } from "@/types/audit";
import { hashString, seededUnit } from "./hash";

function scoreFromSeed(seed: number, min: number, max: number): number {
  const u = seededUnit(seed);
  return Math.round(min + u * (max - min));
}

export interface SimulatedScores {
  scores: AuditScoreSlice[];
  dataSource: AuditDataSource;
}

/** Scores déterministes à partir de l’URL — même URL ⇒ même résultat (démo stable). */
export function simulatePageSpeedScores(url: string): SimulatedScores {
  const h = hashString(url);
  const scores: AuditScoreSlice[] = [
    {
      id: "performance",
      label: "Performance",
      score: scoreFromSeed(h + 1, 38, 96),
    },
    {
      id: "seo",
      label: "SEO",
      score: scoreFromSeed(h + 2, 45, 98),
    },
    {
      id: "accessibility",
      label: "Accessibilité",
      score: scoreFromSeed(h + 3, 42, 97),
    },
    {
      id: "design",
      label: "Design & UX",
      score: scoreFromSeed(h + 4, 40, 95),
    },
  ];
  return { scores, dataSource: "simulated" };
}

/** Si fetch HTML impossible : heuristique de secours pour OPLead (déterministe). */
export function simulateBasicFormFallback(url: string): boolean {
  const h = hashString(url + "oplead");
  return seededUnit(h) > 0.42;
}

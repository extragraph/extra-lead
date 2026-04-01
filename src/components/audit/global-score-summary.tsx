import type { AuditScoreSlice, DesignAgeEstimate } from "@/types/audit";
import {
  getGlobalAverage,
  gradeBadgeClass,
  gradeTone,
  letterGradeFromAverage,
} from "@/lib/score-grade";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar, Lightbulb, TrendingUp } from "lucide-react";

type Props = {
  scores: AuditScoreSlice[];
  suggestions: string[];
  designAge?: DesignAgeEstimate | null;
};

export function GlobalScoreSummary({ scores, suggestions, designAge }: Props) {
  const avg = getGlobalAverage(scores);
  const letter = letterGradeFromAverage(avg);
  const tone = gradeTone(letter);
  const ring =
    tone === "green"
      ? "from-emerald-500/20 to-cyan-500/10"
      : tone === "lime"
        ? "from-lime-500/15 to-emerald-500/10"
        : tone === "amber"
          ? "from-amber-500/20 to-orange-500/10"
          : tone === "orange"
            ? "from-orange-500/20 to-rose-500/10"
            : "from-rose-500/25 to-red-500/10";

  let cardSkin = "";
  switch (tone) {
    case "green":
      cardSkin = "!border-emerald-500/30 ring-1 ring-emerald-500/10 !bg-none !bg-emerald-500/[0.03]";
      break;
    case "lime":
      cardSkin = "!border-lime-500/30 ring-1 ring-lime-500/10 !bg-none !bg-lime-500/[0.03]";
      break;
    case "amber":
      cardSkin = "!border-amber-500/40 ring-1 ring-amber-500/15 !bg-none !bg-amber-500/[0.05]";
      break;
    case "orange":
      cardSkin = "!border-orange-500/40 ring-1 ring-orange-500/15 !bg-none !bg-orange-500/[0.05]";
      break;
    case "red":
      cardSkin = "!border-rose-500/40 ring-1 ring-rose-500/15 !bg-none !bg-rose-500/[0.06]";
      break;
  }

  const ageColor = designAge
    ? designAge.ageYears >= 5
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : designAge.ageYears >= 3
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800"
    : null;

  const ageLabel = designAge
    ? designAge.ageYears >= 5
      ? "Design obsolète"
      : designAge.ageYears >= 3
        ? "Design vieillissant"
        : "Design récent"
    : null;

  return (
    <GlassCard variant="strong" className={`flex flex-col gap-8 p-6 sm:p-8 transition-colors duration-700 ${cardSkin}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Score global
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <span
            className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-4xl font-bold tabular-nums tracking-tight shadow-lg ${gradeBadgeClass(tone)}`}
          >
            {letter}
          </span>
            <span className="text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
              {avg}
            </span>
            <span className="text-lg font-medium text-muted">/100</span>
        </div>

        {designAge && ageColor && (
          <div className={`mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${ageColor}`}>
            <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{ageLabel} — conception estimée à <strong>{designAge.estimatedYear}</strong> ({designAge.ageYears} an{designAge.ageYears > 1 ? "s" : ""})</span>
          </div>
        )}

        <p className="mt-4 text-sm leading-relaxed text-muted font-medium">
          Score pondéré : Performance et SEO comptent davantage (impact fort sur le
          référencement), puis Accessibilité et Design &amp; UX. La lettre résume la santé globale
          du site.
        </p>
      </div>

      <div className="border-t border-[var(--panel-border)] pt-6">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-300">
          <Lightbulb className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <h4 className="text-sm font-semibold text-foreground">Suggestions d&apos;amélioration</h4>
        </div>
        {suggestions.length > 0 ? (
          <ul className="mt-4 list-inside list-disc space-y-2.5 text-sm leading-relaxed text-muted font-medium">
            {suggestions.map((line, i) => (
              <li key={i} className="marker:text-violet-600 dark:marker:text-violet-400">
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Aucune alerte majeure sur les critères suivis — poursuivez avec le détail des jauges et
            la section Détails.
          </p>
        )}
      </div>

      <div
        className={`mt-auto flex items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-gradient-to-br ${ring} px-4 py-3 text-xs text-muted font-medium`}
      >
        <TrendingUp className="h-4 w-4 shrink-0 text-violet-500 dark:text-zinc-500" strokeWidth={1.5} />
        <span>
          Synthèse instantanée — affinez avec le détail des jauges ci-dessous.
        </span>
      </div>
    </GlassCard>
  );
}


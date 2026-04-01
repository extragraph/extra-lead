import { FileDown, Gauge, Palette } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const items = [
  {
    icon: Gauge,
    title: "Performance & Core Web Vitals",
    desc: "Scores réels via PageSpeed (SEO, accessibilité, perf).",
    accent: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/10",
  },
  {
    icon: Palette,
    title: "Design & UX",
    desc: "SSL/HTTPS, méta title & description, favicon, responsive, CTA.",
    accent: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-500/10",
  },
  {
    icon: FileDown,
    title: "Export PDF",
    desc: "Rapport branded (logo placeholder) pour vos envois clients.",
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/10",
  },
] as const;

export function FeaturePreviewRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(({ icon: Icon, title, desc, accent, bg }) => (
        <GlassCard key={title} className="p-5">
          <div className={`mb-3 inline-flex rounded-lg ${bg} p-2`}>
            <Icon className={`h-5 w-5 ${accent}`} strokeWidth={1.75} />
          </div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
        </GlassCard>
      ))}
    </div>
  );
}

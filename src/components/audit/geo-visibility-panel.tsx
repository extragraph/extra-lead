import { GlassCard } from "@/components/ui/glass-card";
import type { GeoVisibility } from "@/types/audit";
import { Bot, FileText, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

export function GeoVisibilityPanel({ geo }: { geo?: GeoVisibility }) {
  if (!geo) return null;

  return (
    <GlassCard variant="default" className="p-5 sm:p-6 mb-8 border-indigo-500/20 bg-indigo-500/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          <Bot className="h-6 w-6 text-indigo-400 relative z-10 p-1 bg-zinc-900 rounded-full ring-2 ring-zinc-800" />
          <svg className="h-6 w-6 text-blue-400 relative z-0 p-1 bg-zinc-900 rounded-full ring-2 ring-zinc-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            Visibilité IA (GEO)
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300">Nouveau</span>
          </h3>
          <p className="text-sm text-zinc-400">Le site est-il prêt pour ChatGPT Search, Gemini et Perplexity ?</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-6">
        {/* Robots.txt Check */}
        <div className="rounded-xl bg-black/40 border border-white/5 p-4 flex gap-4">
          <div className="mt-1 shrink-0">
            {geo.robotsTxtBlocksAI === true ? (
              <XCircle className="h-5 w-5 text-rose-500" />
            ) : geo.robotsTxtBlocksAI === false ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <HelpCircle className="h-5 w-5 text-zinc-500" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-zinc-200">Accès Crawlers IA</h4>
            <div className="mt-1 text-sm text-zinc-400">
              {geo.robotsTxtBlocksAI === true ? (
                <span className="text-rose-400 font-medium">Alerte Rouge :</span>
              ) : geo.robotsTxtBlocksAI === false ? (
                <span className="text-emerald-400 font-medium">Autorisé :</span>
              ) : (
                <span>Inconnu :</span>
              )}{" "}
              {geo.robotsTxtBlocksAI === true 
                ? "Le robots.txt bloque explicitement l'accès aux robots d'IA (GPTBot, ClaudeBot...). Vous êtes invisibles sur les moteurs de réponses."
                : geo.robotsTxtBlocksAI === false
                ? "Le robots.txt autorise l'exploration par les IA."
                : "Impossible de vérifier le fichier robots.txt."}
            </div>
          </div>
        </div>

        {/* LLMs.txt Check */}
        <div className="rounded-xl bg-black/40 border border-white/5 p-4 flex gap-4">
          <div className="mt-1 shrink-0">
            {geo.hasLlmsTxt ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <XCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-zinc-200">Fichier /llms.txt</h4>
            <div className="mt-1 text-sm text-zinc-400">
              {geo.hasLlmsTxt ? (
                <span className="text-emerald-400 font-medium">Présent :</span>
              ) : (
                <span className="text-amber-400 font-medium">Manquant :</span>
              )}{" "}
              {geo.hasLlmsTxt 
                ? "Le site propose un fichier llms.txt standardisé pour faciliter sa compréhension par les grands modèles de langage."
                : "Le site n'a pas implémenté le nouveau standard llms.txt. C'est le moment de devancer la concurrence avant que cela ne devienne la norme."}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

import { Magnet, TrendingUp } from "lucide-react";

/** Emplacement réservé au logo graphiste — remplacer par <Image> ou SVG. Icône : attraction de leads + croissance. */
export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-emerald-500/15" />
        <Magnet
          className="relative z-10 h-7 w-7 text-cyan-300"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/90 text-[10px] shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
          <TrendingUp className="h-3 w-3 text-white" strokeWidth={2.5} aria-hidden />
        </span>
      </div>
      <div className="min-w-0 text-left">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Logo
        </p>
        <p className="truncate text-xs text-zinc-400">Remplacez par votre fichier</p>
      </div>
    </div>
  );
}

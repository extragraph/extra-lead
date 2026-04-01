import { Goal } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function BrandMark() {
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white/80 dark:border-white/10 dark:bg-zinc-900/80"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-emerald-500/15" />
        <Goal
          className="relative z-10 h-7 w-7 text-cyan-600 dark:text-cyan-300"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {APP_NAME}
      </h1>
    </div>
  );
}

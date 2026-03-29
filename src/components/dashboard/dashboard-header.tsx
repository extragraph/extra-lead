import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { BrandMark } from "./brand-mark";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-4">
        <BrandMark />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            <span className="text-gradient-neon">{APP_NAME}</span>
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            {APP_TAGLINE}
          </p>
        </div>
      </div>
      <div className="hidden sm:block">
        <p className="text-right text-xs font-medium uppercase tracking-widest text-zinc-500">
          Prospection
        </p>
        <p className="text-right text-sm text-zinc-400">Audit express en un clic</p>
      </div>
    </header>
  );
}

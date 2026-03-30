import { APP_TAGLINE } from "@/lib/constants";
import { BrandMark } from "./brand-mark";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-8">
      <div className="space-y-4">
        <BrandMark />
        <p className="max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
          {APP_TAGLINE}
        </p>
      </div>
    </header>
  );
}

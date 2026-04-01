"use client";

import { readAuditSoundPreference, writeAuditSoundPreference } from "@/lib/sounds/audit-sound-preference";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

const HINT_ID = "audit-sound-toggle-hint";

export function AuditSoundToggle() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnabled(readAuditSoundPreference());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    writeAuditSoundPreference(enabled);
  }, [enabled, mounted]);

  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--input-bg)] px-3 py-2 text-xs text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-950/60">
      <input
        type="checkbox"
        role="switch"
        aria-checked={enabled}
        className="sr-only"
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
        aria-describedby={HINT_ID}
      />
      {enabled ? (
        <Volume2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400/90" strokeWidth={2} aria-hidden />
      ) : (
        <VolumeX className="h-3.5 w-3.5 text-zinc-500" strokeWidth={2} aria-hidden />
      )}
      <span className="whitespace-nowrap text-muted">Son quand le rapport est prêt</span>
      <span id={HINT_ID} className="sr-only">
        {enabled ? "activé" : "désactivé"}, préférence enregistrée sur cet appareil
      </span>
    </label>
  );
}

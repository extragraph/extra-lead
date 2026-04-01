"use client";

import { AuditResults } from "@/components/audit/audit-results";
import { AuditSoundToggle } from "@/components/dashboard/audit-sound-toggle";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FeaturePreviewRow } from "@/components/dashboard/feature-preview-row";
import { UrlScannerCard } from "@/components/dashboard/url-scanner-card";
import type { AuditPayload } from "@/types/audit";
import { primeAuditSoundContext, playAuditReadyChime } from "@/lib/sounds/audit-ready-chime";
import { readAuditSoundPreference } from "@/lib/sounds/audit-sound-preference";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { HistorySidebar } from "@/components/dashboard/history-sidebar";
import { saveAudit } from "@/lib/audit/history-store";
import { useRef, useState } from "react";

export function AuditDashboard({ hasPageSpeedKey = false }: { hasPageSpeedKey?: boolean }) {
  const [audit, setAudit] = useState<AuditPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerExpanded, setScannerExpanded] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  async function runScan(payload: { url: string; city?: string; activity?: string }) {
    audioCtxRef.current = primeAuditSoundContext(audioCtxRef.current);
    setAudit(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: payload.url,
          ...(payload.city ? { city: payload.city } : {}),
          ...(payload.activity ? { activity: payload.activity } : {}),
        }),
      });
      const data = (await res.json()) as { error?: string } & Partial<AuditPayload>;
      if (!res.ok) {
        setError(data.error || "Erreur lors de l’audit.");
        return;
      }
      if (!data.scores || !data.url || data.openGraph == null) {
        setError("Réponse invalide.");
        return;
      }
      setAudit(data as AuditPayload);
      setScannerExpanded(false);
      saveAudit(data as AuditPayload).catch(console.error);
      
      if (readAuditSoundPreference()) {
        playAuditReadyChime(audioCtxRef.current);
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="extralead-bg relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2] dark:opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='currentColor' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-12 text-foreground sm:px-6 sm:py-16 lg:px-8">
        <HistorySidebar onSelectAudit={(a) => { setAudit(a); setScannerExpanded(false); }} />
        
        <header className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <DashboardHeader />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AuditSoundToggle />
            </div>
          </div>
          <p className="whitespace-nowrap text-sm leading-relaxed text-muted sm:text-base">
            {APP_TAGLINE}
          </p>
        </header>

        <main className="mt-12 flex flex-1 flex-col gap-10">
          <UrlScannerCard 
            onScan={runScan} 
            loading={loading} 
            hasPageSpeedKey={hasPageSpeedKey} 
            expanded={scannerExpanded}
            onToggle={() => setScannerExpanded(!scannerExpanded)}
          />
          {error && (
            <p
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              role="alert"
            >
              {error}
            </p>
          )}
          {audit && <AuditResults key={`${audit.url}-${audit.auditedAt}`} payload={audit} />}
          {!audit && <FeaturePreviewRow />}
        </main>

        <footer className="mt-auto pt-16 text-center text-xs text-muted">
          Extra-Lead — PageSpeed si clé Google configurée, sinon scores simulés pour la démo.
        </footer>
      </div>
    </div>
  );
}

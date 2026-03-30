"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ImageOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  pageUrl: string;
  initialScreenshot?: string;
  onScreenshotCaptured?: (dataUrl: string) => void;
};

export function SiteScreenshotCard({ pageUrl, initialScreenshot, onScreenshotCaptured }: Props) {
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">(
    initialScreenshot ? "ok" : "loading"
  );
  const [imageDecoded, setImageDecoded] = useState(initialScreenshot ? true : false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(initialScreenshot || null);

  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const revokeCurrent = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    const run = async () => {
      if (initialScreenshot) {
        setLoadState("ok");
        setBlobUrl(initialScreenshot);
        setImageDecoded(true);
        return;
      }
      setLoadState("loading");
      setImageDecoded(false);
      setErrorDetail(null);
      revokeCurrent();
      setBlobUrl(null);

      const controller = new AbortController();
      const tid = window.setTimeout(() => controller.abort(), 45_000);

      try {
        const qs = new URLSearchParams({ url: pageUrl });
        const base = window.location.origin;
        const res = await fetch(`${base}/api/screenshot?${qs.toString()}`, {
          signal: controller.signal,
        });

        const ct = res.headers.get("content-type") || "";

        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
          throw new Error(j?.detail || j?.error || `Erreur ${res.status}`);
        }

        if (!ct.includes("image")) {
          throw new Error("Le serveur n'a pas renvoyé une image (vérifiez la console serveur).");
        }

        const blob = await res.blob();
        if (cancelled) return;
        if (blob.size < 100) {
          throw new Error("Image reçue vide ou corrompue.");
        }

        revokeCurrent();
        const u = URL.createObjectURL(blob);
        blobUrlRef.current = u;
        setBlobUrl(u);
        setLoadState("ok");

        // Sauvegarder la capture en base64 pour l'historique
        if (onScreenshotCaptured) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              onScreenshotCaptured(reader.result);
            }
          };
          reader.readAsDataURL(blob);
        }
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error
              ? e.name === "AbortError"
                ? "Délai dépassé — réessayez ou testez une autre URL."
                : e.message
              : "Erreur réseau.";
          setErrorDetail(msg);
          setLoadState("error");
        }
      } finally {
        window.clearTimeout(tid);
      }
    };

    void run();

    return () => {
      cancelled = true;
      revokeCurrent();
      setBlobUrl(null);
    };
  }, [pageUrl, initialScreenshot]);

  return (
    <GlassCard variant="strong" className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-3">
        <h3 className="text-sm font-semibold text-white">Aperçu du site</h3>
        <p className="text-xs text-zinc-500">Capture mobile (viewport) — rendu réel du prospect</p>
      </div>

      <div className="relative bg-zinc-950/50 p-4 sm:p-5">
        <div
          className={`relative overflow-hidden rounded-2xl bg-zinc-900/40 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-white/10 ${loadState === "ok" ? "opacity-100" : "min-h-[280px]"}`}
        >
          {(loadState === "loading" || (loadState === "ok" && blobUrl && !imageDecoded)) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-900/90">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" strokeWidth={1.5} />
              <p className="text-xs text-zinc-500">
                {loadState === "loading" ? "Génération de la capture…" : "Affichage de l’image…"}
              </p>
            </div>
          )}

          {loadState === "error" && (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 bg-zinc-900/90 px-6 text-center">
              <ImageOff className="h-10 w-10 text-zinc-600" strokeWidth={1.25} />
              <p className="text-sm text-zinc-400">
                Impossible d’afficher la capture (timeout, blocage ou page trop lourde).
              </p>
              {errorDetail && (
                <p className="max-w-sm text-xs text-zinc-600">{errorDetail}</p>
              )}
              <p className="text-[11px] text-zinc-600">
                En local : si Chromium échoue, définissez{" "}
                <code className="rounded bg-zinc-800 px-1">CHROME_PATH</code> ou{" "}
                <code className="rounded bg-zinc-800 px-1">PUPPETEER_EXECUTABLE_PATH</code> vers{" "}
                <code className="rounded bg-zinc-800 px-1">chrome.exe</code>.
              </p>
            </div>
          )}

          {loadState === "ok" && blobUrl && (
            /* eslint-disable-next-line @next/next/no-img-element -- blob: URL créée côté client */
            <img
              src={blobUrl}
              alt=""
              className={`h-auto w-full object-cover object-top transition duration-500 ${imageDecoded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageDecoded(true)}
              onError={() => {
                if (blobUrlRef.current) {
                  URL.revokeObjectURL(blobUrlRef.current);
                  blobUrlRef.current = null;
                }
                setBlobUrl(null);
                setErrorDetail("Impossible d’afficher l’image générée.");
                setLoadState("error");
              }}
            />
          )}
        </div>
      </div>
    </GlassCard>
  );
}

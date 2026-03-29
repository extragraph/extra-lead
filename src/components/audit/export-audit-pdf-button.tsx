"use client";

import type { AuditPayload } from "@/types/audit";
import { FileDown } from "lucide-react";
import { generateAuditPdf } from "@/lib/pdf/generate-audit-pdf";

export function ExportAuditPdfButton({ audit }: { audit: AuditPayload }) {
  return (
    <button
      type="button"
      onClick={() => generateAuditPdf(audit)}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-5 py-2.5 text-sm font-medium text-zinc-100 shadow-inner transition hover:border-cyan-500/30 hover:bg-zinc-800/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
    >
      <FileDown className="h-4 w-4 text-cyan-400" strokeWidth={2} />
      Exporter l’audit (PDF)
    </button>
  );
}

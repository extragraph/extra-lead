"use client";

import { useState, useEffect } from "react";
import { History, X, Trash2, Archive, Loader2, ArrowRight, Download, Upload } from "lucide-react";
import { getAudits, deleteAudit, toggleArchiveAudit, importAudits, type SavedAudit } from "@/lib/audit/history-store";
import type { AuditPayload } from "@/types/audit";
import { getGlobalAverage } from "@/lib/score-grade";

export function HistorySidebar({ onSelectAudit }: { onSelectAudit: (audit: AuditPayload) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [audits, setAudits] = useState<SavedAudit[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAudits();
    }
  }, [isOpen]);

  async function loadAudits() {
    setLoading(true);
    const data = await getAudits();
    setAudits(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await deleteAudit(id);
    setAudits(audits.filter((a) => a.id !== id));
  }

  async function handleToggleArchive(id: string, currentStatus: boolean) {
    await toggleArchiveAudit(id, !currentStatus);
    setAudits(
      audits.map((a) => (a.id === id ? { ...a, archived: !currentStatus } : a))
    );
  }

  const displayedAudits = audits.filter((a) => a.archived === showArchived);

  async function handleExport() {
    const data = await getAudits();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extra-lead-audits-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string) as SavedAudit[];
        if (Array.isArray(json)) {
           await importAudits(json);
           await loadAudits();
        } else {
           alert("Fichier non valide ou corrompu.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 rounded-full bg-zinc-900 border border-zinc-700 p-4 text-white shadow-xl hover:bg-zinc-800 transition-transform hover:scale-105"
        aria-label="Voir l'historique"
      >
        <History className="h-5 w-5" />
        <span className="hidden text-sm font-medium sm:block">Historique</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">Vos audits</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-800 p-2">
          <div className="flex rounded-lg bg-zinc-900 p-1 w-full">
            <button
              onClick={() => setShowArchived(false)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                !showArchived ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              Récents
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                showArchived ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
               Archivés
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : displayedAudits.length === 0 ? (
            <div className="text-center p-8 text-zinc-500">
              <p className="text-sm">Aucun audit trouvé.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {displayedAudits.map((item) => {
                const globalScore = getGlobalAverage(item.payload.scores);
                const scoreColor = globalScore >= 75 ? "text-emerald-400" : globalScore >= 50 ? "text-amber-400" : "text-rose-400";
                
                return (
                  <li
                    key={item.id}
                    className="group relative flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <span className="truncate text-sm font-medium text-zinc-200">
                          {item.url.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(item.auditedAt).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className={`text-xl font-bold ${scoreColor}`}>
                        {globalScore}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          onSelectAudit(item.payload);
                          setIsOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        Ouvrir
                      </button>
                      <button
                        onClick={() => handleToggleArchive(item.id, item.archived)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                        title={item.archived ? "Désarchiver" : "Archiver"}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        

        <div className="border-t border-zinc-800 p-4 shrink-0 bg-zinc-950">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Sauvegarder l'historique dans un fichier"
            >
              <Download className="h-4 w-4" /> Exporter
            </button>
            <label
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-900 border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Charger un fichier d'historique"
            >
              <Upload className="h-4 w-4" /> Importer
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

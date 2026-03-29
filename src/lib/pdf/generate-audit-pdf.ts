import type { AuditPayload } from "@/types/audit";
import { jsPDF } from "jspdf";
import { APP_NAME } from "@/lib/constants";

/** PDF type « keynote » : grandes marges, hiérarchie claire, touches de couleur — pas une liste de courses. */

const M = 22;
const PAGE_W = 210;
const PAGE_H = 297;
const FOOTER_H = 16;

const FOOTER_CREDIT =
  "Rapport de performance et de conversion généré par l'écosystème Extragraph.fr.";

/** Ligne en dégradé simulée (segments RGB interpolés). */
function drawGradientSeparator(doc: jsPDF, y: number, x1: number, x2: number, thicknessMm = 0.55) {
  const segments = 48;
  const w = (x2 - x1) / segments;
  const c1 = { r: 34, g: 211, b: 238 };
  const c2 = { r: 167, g: 139, b: 250 };
  const c3 = { r: 52, g: 211, b: 153 };

  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    let r: number;
    let g: number;
    let b: number;
    if (t <= 0.5) {
      const u = t / 0.5;
      r = Math.round(c1.r + (c2.r - c1.r) * u);
      g = Math.round(c1.g + (c2.g - c1.g) * u);
      b = Math.round(c1.b + (c2.b - c1.b) * u);
    } else {
      const u = (t - 0.5) / 0.5;
      r = Math.round(c2.r + (c3.r - c2.r) * u);
      g = Math.round(c2.g + (c3.g - c2.g) * u);
      b = Math.round(c2.b + (c3.b - c2.b) * u);
    }
    doc.setFillColor(r, g, b);
    doc.rect(x1 + i * w, y, w + 0.15, thicknessMm, "F");
  }
}

/**
 * En-tête moderne Extra-Lead : marque à gauche, date + URL à droite, séparateur dégradé.
 * Retourne la position Y de début du contenu.
 */
function drawModernHeader(doc: jsPDF, audit: AuditPayload, dateStr: string): number {
  const headerTop = 14;
  const brandY = headerTop + 6;
  const rightColX = PAGE_W - M;

  doc.setTextColor(18, 18, 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(APP_NAME, M, brandY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(115, 115, 125);
  doc.text(`Audit du ${dateStr}`, rightColX, headerTop + 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(48, 48, 56);
  const urlMaxW = 92;
  const urlLines = doc.splitTextToSize(audit.url, urlMaxW);
  let urlY = headerTop + 9;
  for (const line of urlLines.slice(0, 4)) {
    doc.text(line, rightColX, urlY, { align: "right" });
    urlY += 3.6;
  }

  const sepY = Math.max(brandY + 4, urlY + 2);
  drawGradientSeparator(doc, sepY, M, PAGE_W - M, 0.5);

  return sepY + 6;
}

function drawFooter(doc: jsPDF) {
  const lineY = PAGE_H - FOOTER_H + 2;
  drawGradientSeparator(doc, lineY - 1.5, M, PAGE_W - M, 0.25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 120);
  const lines = doc.splitTextToSize(FOOTER_CREDIT, PAGE_W - 2 * M);
  doc.text(lines, PAGE_W / 2, lineY + 2, { align: "center" });
}

function applyFootersToAllPages(doc: jsPDF) {
  const n = doc.getNumberOfPages();
  for (let p = 1; p <= n; p++) {
    doc.setPage(p);
    drawFooter(doc);
  }
}

function scoreColor(score: number): [number, number, number] {
  if (score >= 75) return [52, 211, 153];
  if (score >= 50) return [251, 191, 36];
  return [248, 113, 113];
}

function contentBottom(): number {
  return PAGE_H - FOOTER_H - 4;
}

export function generateAuditPdf(audit: AuditPayload): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const dateStr = new Date(audit.auditedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFillColor(252, 252, 254);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  let y = drawModernHeader(doc, audit, dateStr);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(28, 28, 32);
  doc.text("Audit web — synthèse", M, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 118);
  doc.text(sourceLabel(audit), M, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(28, 28, 32);
  doc.text("Scores Lighthouse & synthèse", M, y);
  y += 10;

  const cols = 2;
  const colW = (PAGE_W - 2 * M - 10) / cols;
  let col = 0;
  let rowY = y;

  const ensureSpace = (need: number) => {
    if (rowY + need > contentBottom()) {
      doc.addPage();
      doc.setFillColor(252, 252, 254);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      rowY = drawModernHeader(doc, audit, dateStr);
      col = 0;
    }
  };

  for (const s of audit.scores) {
    ensureSpace(32);
    const x = M + col * (colW + 10);
    const rgb = scoreColor(s.score);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, rowY, colW, 28, 3, 3, "F");
    doc.setDrawColor(235, 235, 240);
    doc.roundedRect(x, rowY, colW, 28, 3, 3, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 108);
    doc.text(s.label, x + 5, rowY + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text(String(s.score), x + 5, rowY + 21);

    col += 1;
    if (col >= cols) {
      col = 0;
      rowY += 32;
    }
  }
  y = rowY + (col > 0 ? 32 : 0) + 6;

  if (y > contentBottom() - 65) {
    doc.addPage();
    doc.setFillColor(252, 252, 254);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    y = drawModernHeader(doc, audit, dateStr);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(28, 28, 32);
  doc.text("Design & expérience", M, y);
  y += 10;

  for (const c of audit.designChecks) {
    if (y > contentBottom() - 18) {
      doc.addPage();
      doc.setFillColor(252, 252, 254);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      y = drawModernHeader(doc, audit, dateStr);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(28, 28, 32);
    doc.text((c.ok ? "✓ " : "○ ") + c.label, M, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 98);
    const dLines = doc.splitTextToSize(c.detail || "", PAGE_W - 2 * M - 4);
    doc.text(dLines, M + 4, y);
    y += 5 + (dLines.length - 1) * 4.2;
    y += 3;
  }

  if (audit.blockingPoints.length > 0) {
    y += 4;
    if (y > contentBottom() - 38) {
      doc.addPage();
      doc.setFillColor(252, 252, 254);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      y = drawModernHeader(doc, audit, dateStr);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(28, 28, 32);
    doc.text("Points d’attention", M, y);
    y += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(70, 70, 78);
    for (const p of audit.blockingPoints.slice(0, 8)) {
      if (y > contentBottom() - 12) {
        doc.addPage();
        doc.setFillColor(252, 252, 254);
        doc.rect(0, 0, PAGE_W, PAGE_H, "F");
        y = drawModernHeader(doc, audit, dateStr);
      }
      const lines = doc.splitTextToSize(`• ${p}`, PAGE_W - 2 * M);
      doc.text(lines, M, y);
      y += 5 + (lines.length - 1) * 4.5;
    }
  }

  if (y > contentBottom() - 50) {
    doc.addPage();
    doc.setFillColor(252, 252, 254);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    y = drawModernHeader(doc, audit, dateStr);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(28, 28, 32);
  doc.text(audit.oplead.headline, M, y);
  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 55, 62);
  const opLines = doc.splitTextToSize(audit.oplead.body, PAGE_W - 2 * M);
  doc.text(opLines, M, y);
  y += 8 + (opLines.length - 1) * 5;

  if (audit.openGraph.present) {
    y += 6;
    if (y > contentBottom() - 42) {
      doc.addPage();
      doc.setFillColor(252, 252, 254);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      y = drawModernHeader(doc, audit, dateStr);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(28, 28, 32);
    doc.text("Aperçu Open Graph (partage social)", M, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 55, 62);
    if (audit.openGraph.title) {
      const tLines = doc.splitTextToSize(`Titre : ${audit.openGraph.title}`, PAGE_W - 2 * M);
      doc.text(tLines, M, y);
      y += 5 + (tLines.length - 1) * 4;
    }
    if (audit.openGraph.description) {
      const dLines = doc.splitTextToSize(
        `Description : ${audit.openGraph.description}`,
        PAGE_W - 2 * M,
      );
      doc.text(dLines, M, y);
      y += 5 + (dLines.length - 1) * 4;
    }
    if (audit.openGraph.imageUrl) {
      const iLines = doc.splitTextToSize(`Image (og:image) : ${audit.openGraph.imageUrl}`, PAGE_W - 2 * M);
      doc.text(iLines, M, y);
      y += 5 + (iLines.length - 1) * 4;
    }
  }

  applyFootersToAllPages(doc);

  doc.save(`extra-lead-${hostSlug(audit.url)}.pdf`);
}

function hostSlug(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    return h.replace(/[^a-z0-9.-]+/gi, "_").slice(0, 48) || "rapport";
  } catch {
    return "rapport";
  }
}

function sourceLabel(audit: AuditPayload): string {
  switch (audit.dataSource) {
    case "pagespeed":
      return "Données PageSpeed Insights (Google)";
    case "pagespeed_partial":
      return "Scores simulés — clé PageSpeed présente mais appel API en échec";
    default:
      return "Scores simulés — définissez GOOGLE_API_KEY (ou GOOGLE_PAGESPEED_API_KEY) pour les mesures réelles";
  }
}

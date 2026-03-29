import type { DesignCheckItem, OpenGraphPreview } from "@/types/audit";
import { parseOpenGraph } from "./open-graph";

export interface DesignAnalysis {
  checks: DesignCheckItem[];
  designScore: number;
  openGraph: OpenGraphPreview;
}

function hasDocumentTitle(html: string): boolean {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return !!m && m[1].replace(/\s+/g, " ").trim().length >= 3;
}

function hasMetaDescription(html: string): boolean {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/name\s*=\s*["']description["']/i.test(tag)) continue;
    const cm = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    if (cm && cm[1].trim().length >= 15) return true;
  }
  return false;
}

export function analyzeDesignFromHtml(
  pageUrl: string,
  html: string | null,
  lighthouseViewportOk?: boolean,
): DesignAnalysis {
  const u = (() => {
    try {
      return new URL(pageUrl);
    } catch {
      return null;
    }
  })();

  const pageFetched = html !== null && html.length > 0;
  const httpsOk = u?.protocol === "https:";

  let faviconOk = false;
  let ctaOk = false;
  let responsiveHint = !!lighthouseViewportOk;
  let titleOk = false;
  let metaDescOk = false;
  let openGraph: OpenGraphPreview = { present: false };

  if (html) {
    const h = html.toLowerCase();
    faviconOk =
      /rel\s*=\s*["'][^"']*icon[^"']*["']/.test(html) ||
      h.includes("favicon") ||
      h.includes("apple-touch-icon");
    ctaOk =
      /(contact|devis|demande|réserver|appelez|call|cta)/i.test(html) &&
      (/<button\b/i.test(html) || /role\s*=\s*["']button["']/i.test(html) || /class\s*=\s*["'][^"']*btn/i.test(html));
    if (!responsiveHint) {
      responsiveHint =
        /viewport/.test(h) && (/width\s*=\s*device-width/i.test(h) || /initial-scale/i.test(h));
    }
    titleOk = hasDocumentTitle(html);
    metaDescOk = hasMetaDescription(html);
    openGraph = parseOpenGraph(html, pageUrl);
  }

  const ogOk = openGraph.present;

  let sslDetail: string;
  if (!httpsOk) {
    sslDetail = "Pas de HTTPS — pas de chiffrement TLS ni certificat côté URL.";
  } else if (pageFetched) {
    sslDetail =
      "HTTPS actif — la requête a abouti avec un certificat SSL/TLS valide (TLS côté serveur).";
  } else {
    sslDetail =
      "URL en HTTPS — impossible de confirmer le certificat : la page n’a pas pu être chargée (timeout, blocage, etc.).";
  }

  const checks: DesignCheckItem[] = [
    {
      id: "ssl",
      label: "Certificat SSL / HTTPS",
      ok: httpsOk,
      detail: sslDetail,
    },
    {
      id: "meta-title",
      label: "Balise <title>",
      ok: titleOk,
      detail: titleOk
        ? "Titre de page présent (SEO & onglet navigateur)."
        : pageFetched
          ? "Ajoutez une balise <title> unique et descriptive."
          : "Analyse impossible sans chargement du HTML.",
    },
    {
      id: "meta-description",
      label: "Meta description",
      ok: metaDescOk,
      detail: metaDescOk
        ? "Meta name=\"description\" renseignée (snippet Google)."
        : pageFetched
          ? "Ajoutez une meta description (≈ 150–160 car.) pour le référencement."
          : "Analyse impossible sans chargement du HTML.",
    },
    {
      id: "open-graph",
      label: "Open Graph (réseaux sociaux)",
      ok: ogOk,
      detail: ogOk
        ? "Balises og: détectées (titre, image et/ou description de partage)."
        : pageFetched
          ? "Ajoutez des meta property=\"og:title\", og:image, og:description… pour les aperçus de liens."
          : "Analyse impossible sans chargement du HTML.",
    },
    {
      id: "favicon",
      label: "Favicon",
      ok: faviconOk,
      detail: faviconOk ? "Icône d’onglet détectée" : "Ajoutez un favicon pour le repère visuel",
    },
    {
      id: "responsive",
      label: "Viewport / responsive",
      ok: responsiveHint,
      detail: responsiveHint ? "Balise viewport présente" : "Vérifiez la meta viewport mobile",
    },
    {
      id: "cta",
      label: "Appel à l’action (CTA)",
      ok: ctaOk,
      detail: ctaOk ? "Élément type bouton / contact repéré" : "Renforcez un CTA visible (contact, devis…)",
    },
  ];

  const okCount = checks.filter((c) => c.ok).length;
  const designScore = Math.round((okCount / checks.length) * 100);

  return { checks, designScore, openGraph };
}

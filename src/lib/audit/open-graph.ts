/** Extraction des balises Open Graph (meta property="og:*") depuis le HTML brut. */

import type { OpenGraphPreview } from "@/types/audit";

function getMetaContent(tag: string): string | null {
  const dq = tag.match(/\bcontent\s*=\s*"([^"]*)"/i);
  if (dq) return dq[1].trim();
  const sq = tag.match(/\bcontent\s*=\s*'([^']*)'/i);
  if (sq) return sq[1].trim();
  return null;
}

function getProperty(tag: string): string | null {
  const dq = tag.match(/\bproperty\s*=\s*"([^"]*)"/i);
  if (dq) return dq[1].trim().toLowerCase();
  const sq = tag.match(/\bproperty\s*=\s*'([^']*)'/i);
  if (sq) return sq[1].trim().toLowerCase();
  return null;
}

export function parseOpenGraph(html: string, pageUrl: string): OpenGraphPreview {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  let title: string | undefined;
  let description: string | undefined;
  let imageUrl: string | null | undefined;
  let hasOg = false;

  for (const tag of tags) {
    const prop = getProperty(tag);
    if (!prop || !prop.startsWith("og:")) continue;
    const content = getMetaContent(tag);
    if (!content) continue;
    hasOg = true;
    if (prop === "og:title") title = content;
    if (prop === "og:description") description = content;
    if (prop === "og:image") {
      try {
        imageUrl = new URL(content, pageUrl).href;
      } catch {
        imageUrl = content.startsWith("http") ? content : null;
      }
    }
  }

  return {
    present: hasOg,
    title,
    description,
    imageUrl: imageUrl ?? null,
  };
}

export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

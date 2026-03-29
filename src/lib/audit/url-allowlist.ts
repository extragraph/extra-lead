/** Garde-fou minimal contre les abus / SSRF (localhost, IP privées). */

const PRIVATE_IPV4 = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

export function normalizeAuditUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProtocol);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost")) return null;
    if (host === "0.0.0.0") return null;
    if (PRIVATE_IPV4.test(host)) return null;
    if (host.startsWith("127.")) return null;
    if (host === "[::1]" || host === "::1") return null;
    return u.toString();
  } catch {
    return null;
  }
}

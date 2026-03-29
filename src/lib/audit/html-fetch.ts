const FETCH_TIMEOUT_MS = 12_000;

export async function fetchPageHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Extra-Lead/1.0; +https://extra-lead.app) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 800_000);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

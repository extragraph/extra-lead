import { normalizeAuditUrl } from "@/lib/audit/url-allowlist";
import { launchScreenshotBrowser } from "@/lib/screenshot/launch-browser";
import { NextResponse } from "next/server";
import type { Browser } from "puppeteer-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Viewport mobile — deviceScaleFactor 1 pour éviter soucis GPU / mémoire en local Windows. */
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 1 as const };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  const target = normalizeAuditUrl(raw || "");
  if (!target) {
    return NextResponse.json({ error: "URL invalide ou non autorisée." }, { status: 400 });
  }

  let browser: Browser | undefined;

  try {
    browser = await launchScreenshotBrowser();

    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 Extra-Lead/1.0",
    );

    await page.goto(target, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    await sleep(600);
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});

    const buffer = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    if (!buffer || buffer.length < 100) {
      return NextResponse.json(
        { error: "Capture vide ou invalide.", detail: `Taille: ${buffer?.length ?? 0}` },
        { status: 502 },
      );
    }

    const body = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=120",
        "Content-Length": String(body.length),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Capture impossible.";
    console.error("[screenshot]", target, message);
    return NextResponse.json(
      { error: "Échec de la capture d’écran.", detail: message },
      { status: 502 },
    );
  } finally {
    await browser?.close();
  }
}

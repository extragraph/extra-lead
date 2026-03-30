import { launchScreenshotBrowser } from "./launch-browser";
import type { Browser } from "puppeteer-core";

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 1 as const };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function captureScreenshot(url: string): Promise<Buffer> {
  let browser: Browser | undefined;
  try {
    browser = await launchScreenshotBrowser();
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 Extra-Lead/1.0",
    );

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 25_000,
    });

    await sleep(400);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    }).catch(() => {});

    const buffer = await page.screenshot({
      type: "jpeg",
      quality: 85,
      fullPage: false,
      captureBeyondViewport: false,
    });

    if (!buffer || buffer.length < 100) {
      throw new Error("Capture vide ou invalide.");
    }

    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  } finally {
    await browser?.close();
  }
}

import type { Browser } from "puppeteer-core";

/** Sur Windows, on garde Puppeteer « full » (Chrome téléchargé ou CHROME_PATH). @sparticuz/chromium cible Linux serverless. */
function useServerlessChromium(): boolean {
  if (process.platform === "win32") {
    return false;
  }
  return (
    process.env.VERCEL === "1" ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.AWS_EXECUTION_ENV)
  );
}

export async function launchScreenshotBrowser(): Promise<Browser> {
  if (useServerlessChromium()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    chromium.setGraphicsMode = false;

    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      defaultViewport: null,
      executablePath,
      headless: "shell",
    });
  }

  const puppeteer = (await import("puppeteer")).default;
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || process.env.CHROME_PATH?.trim() || undefined;

  return puppeteer.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=390,900",
      "--disable-features=TranslateUI",
    ],
  });
}

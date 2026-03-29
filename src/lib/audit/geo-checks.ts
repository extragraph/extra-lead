import type { GeoVisibility } from "@/types/audit";

const FETCH_TIMEOUT_MS = 5_000; // Keep it short so we don't delay the whole audit too much

export async function checkGeoVisibility(baseUrl: string): Promise<GeoVisibility> {
  let hasLlmsTxt = false;
  let robotsTxtBlocksAI: boolean | null = null;

  try {
    const parsedUrl = new URL(baseUrl);
    const origin = parsedUrl.origin;

    // 1. Check llms.txt (using GET because some servers block HEAD)
    const controller1 = new AbortController();
    const t1 = setTimeout(() => controller1.abort(), FETCH_TIMEOUT_MS);
    try {
      const llmsRes = await fetch(`${origin}/llms.txt`, {
        signal: controller1.signal,
        cache: "no-store",
      });
      if (llmsRes.ok) {
        // Just checking if it replies 200 OK. Could parse but not strictly necessary here.
        hasLlmsTxt = true;
      }
    } catch {
      // Ignore network errors for this file
    } finally {
      clearTimeout(t1);
    }

    // 2. Check robots.txt
    const controller2 = new AbortController();
    const t2 = setTimeout(() => controller2.abort(), FETCH_TIMEOUT_MS);
    try {
      const robotsRes = await fetch(`${origin}/robots.txt`, {
        signal: controller2.signal,
        cache: "no-store",
      });
      
      if (robotsRes.ok) {
        const text = await robotsRes.text();
        robotsTxtBlocksAI = false;
        
        const aiBots = ["gptbot", "claudebot", "anthropic-ai", "google-extended", "perplexitybot"];
        const lines = text.split('\n');
        let currentAgent = "";
        
        for (let line of lines) {
          line = line.trim().toLowerCase();
          if (line.startsWith("user-agent:")) {
            currentAgent = line.substring(11).trim();
          } else if (line.startsWith("disallow:")) {
            const path = line.substring(9).trim();
            // Checking if the bot is blocked globally or if an AI bot is explicitly blocked from the root
            if (path === "/" || path === "/*") {
               if (aiBots.some(bot => currentAgent.includes(bot))) {
                  robotsTxtBlocksAI = true;
                  break;
               }
            }
          }
        }
      } else if (robotsRes.status === 404) {
        robotsTxtBlocksAI = false;
      }
    } catch {
      // Could not fetch robots.txt
    } finally {
      clearTimeout(t2);
    }

  } catch {
    // URL parsing failed
  }

  return { hasLlmsTxt, robotsTxtBlocksAI };
}

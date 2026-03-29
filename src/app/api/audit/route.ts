import { runAudit } from "@/lib/audit/run-audit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
/** Places + plusieurs PageSpeed concurrents — dépasser le défaut Vercel si besoin. */
export const maxDuration = 120;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const url = typeof b.url === "string" ? b.url : String(b.url ?? "");
  const localContext =
    typeof b.city === "string" || typeof b.activity === "string"
      ? {
          ...(typeof b.city === "string" ? { city: b.city } : {}),
          ...(typeof b.activity === "string" ? { activity: b.activity } : {}),
        }
      : undefined;

  const result = await runAudit(url, localContext);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json(result.payload);
}

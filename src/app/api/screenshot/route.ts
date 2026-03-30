import { normalizeAuditUrl } from "@/lib/audit/url-allowlist";
import { captureScreenshot } from "@/lib/screenshot/capture-utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  const target = normalizeAuditUrl(raw || "");
  if (!target) {
    return NextResponse.json({ error: "URL invalide ou non autorisée." }, { status: 400 });
  }

  try {
    const buffer = await captureScreenshot(target);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=120",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Capture impossible.";
    console.error("[screenshot]", target, message);
    return NextResponse.json(
      { error: "Échec de la capture d’écran.", detail: message },
      { status: 502 },
    );
  }
}

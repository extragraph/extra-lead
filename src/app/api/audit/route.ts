import { runAudit } from "@/lib/audit/run-audit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const url =
    typeof body === "object" && body !== null && "url" in body
      ? String((body as { url: unknown }).url ?? "")
      : "";

  const result = await runAudit(url);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json(result.payload);
}

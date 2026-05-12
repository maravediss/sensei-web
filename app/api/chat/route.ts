import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const VALID_PASSCODE = process.env.SENSEI_PASSCODE || "manuel-sensei-2026";
const N8N_WEBHOOK = process.env.N8N_CHAT_WEBHOOK || "http://interhanse-n8n:5678/webhook/sensei-web-chat";

export async function POST(req: Request) {
  const c = await cookies();
  if (c.get("sensei_auth")?.value !== VALID_PASSCODE) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "missing text" }, { status: 400 });
  }

  try {
    const resp = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "web",
        text,
        chat_id: 734020194,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return NextResponse.json({ error: `n8n ${resp.status}: ${t.substring(0, 200)}` }, { status: 502 });
    }
    const data = await resp.json();
    return NextResponse.json({
      reply: data?.reply || data?.text || "(sin respuesta)",
      model: data?.model || data?.modelUsed || null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e).substring(0, 300) }, { status: 500 });
  }
}

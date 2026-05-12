import { requireAuth } from "@/lib/auth";
import { getRecentMessages } from "@/lib/queries";
import { ChatClient } from "./ChatClient";

export const dynamic = "force-dynamic";

export default async function Chat() {
  await requireAuth();
  const raw = await getRecentMessages(40);
  const initial = raw.map((m: any) => ({
    id: String(m.id),
    direction: m.direction as "in" | "out",
    content: String(m.content || ""),
    ts: String(m.ts),
    model_used: m.model_used || null,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Conversación con Sensei</h1>
        <p className="text-sm text-neutral-500 mt-1">Memoria compartida con Telegram.</p>
      </div>
      <ChatClient initial={initial} />
    </div>
  );
}

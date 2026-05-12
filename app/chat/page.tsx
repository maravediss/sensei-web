import { requireAuth } from "@/lib/auth";
import { getRecentMessages } from "@/lib/queries";
import { format, parseISO } from "date-fns";

export const dynamic = "force-dynamic";

export default async function Chat() {
  await requireAuth();
  const msgs = await getRecentMessages(40);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversación con Sensei</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Las conversaciones de Telegram aparecen aquí. Para escribir, usa{" "}
          <a
            href="https://t.me/margital_sensei_bot"
            target="_blank"
            rel="noreferrer"
            className="text-[#21D177] hover:underline"
          >
            @margital_sensei_bot
          </a>
          .
        </p>
      </div>
      <div className="space-y-3">
        {msgs.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin mensajes aún. Escríbele al bot para empezar.</p>
        ) : (
          msgs.map((m: any) => (
            <div
              key={m.id}
              className={`max-w-2xl rounded-2xl p-3 ${
                m.direction === "in"
                  ? "ml-auto bg-[#21D177]/10 border border-[#21D177]/30"
                  : "mr-auto bg-[#111] border border-[#2a2a2a]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {m.direction === "in" ? "Tú" : "Sensei"} · {format(parseISO(m.ts), "d MMM HH:mm")}
                </span>
                {m.model_used && (
                  <span className="text-[10px] text-neutral-600">{m.model_used}</span>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

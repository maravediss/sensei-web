"use client";
import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";

type Msg = {
  id: string;
  direction: "in" | "out";
  content: string;
  ts: string;
  model_used?: string | null;
};

export function ChatClient({ initial }: { initial: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    const optimisticIn: Msg = {
      id: "tmp-" + Date.now(),
      direction: "in",
      content: text,
      ts: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimisticIn]);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await r.json();
      if (data.reply) {
        setMessages((m) => [
          ...m,
          {
            id: "out-" + Date.now(),
            direction: "out",
            content: data.reply,
            ts: new Date().toISOString(),
            model_used: data.model || null,
          },
        ]);
      } else if (data.error) {
        setMessages((m) => [
          ...m,
          {
            id: "err-" + Date.now(),
            direction: "out",
            content: "🔴 Error: " + data.error,
            ts: new Date().toISOString(),
          },
        ]);
      }
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          id: "err-" + Date.now(),
          direction: "out",
          content: "🔴 Error de red: " + String(e?.message || e),
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500">
            Sin mensajes. Empieza preguntando "¿qué entreno toca hoy?" o "¿cuántos sets de pecho llevo esta semana?".
          </p>
        )}
        {messages.map((m) => (
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
                {m.direction === "in" ? "Tú" : "Sensei"} · {format(parseISO(m.ts), "HH:mm")}
              </span>
              {m.model_used && <span className="text-[10px] text-neutral-600">{m.model_used}</span>}
            </div>
            <p className="text-sm whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {sending && (
          <div className="mr-auto bg-[#111] border border-[#2a2a2a] rounded-2xl p-3 max-w-xs">
            <p className="text-sm text-neutral-500">Sensei está pensando...</p>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-[#2a2a2a] pt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe a Sensei..."
            className="flex-1 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white outline-none focus:border-[#21D177]"
            disabled={sending}
          />
          <button type="submit" className="btn-primary disabled:opacity-50" disabled={sending || !input.trim()}>
            {sending ? "..." : "Enviar"}
          </button>
        </form>
        <p className="text-xs text-neutral-500 mt-2">
          También puedes escribir desde{" "}
          <a href="https://t.me/margital_sensei_bot" target="_blank" rel="noreferrer" className="text-[#21D177] hover:underline">
            Telegram
          </a>
          . Misma memoria, misma BD.
        </p>
      </div>
    </div>
  );
}

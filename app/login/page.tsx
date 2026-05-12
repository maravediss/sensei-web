"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [pc, setPc] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const r = await fetch("/api/auth", { method: "POST", body: JSON.stringify({ passcode: pc }) });
    if (r.ok) router.push("/");
    else {
      setErr("Código inválido");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#111] p-6">
        <h1 className="text-xl font-bold">Sensei · acceso</h1>
        <p className="text-sm text-neutral-400">Introduce tu código personal para acceder al panel.</p>
        <input
          type="password"
          value={pc}
          onChange={(e) => setPc(e.target.value)}
          placeholder="código"
          className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white outline-none focus:border-[#21D177]"
          autoFocus
        />
        {err && <p className="text-sm text-[#E95A0C]">{err}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

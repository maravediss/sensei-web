import { requireAuth } from "@/lib/auth";
import { getDashboard } from "@/lib/queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Pecho",
  "chest-upper": "Pecho sup.",
  "chest-lower": "Pecho inf.",
  "back-lats": "Espalda (lats)",
  "back-mid": "Espalda media",
  "delt-anterior": "Hombro ant.",
  "delt-lateral": "Hombro lateral",
  "delt-posterior": "Hombro post.",
  triceps: "Tríceps",
  biceps: "Bíceps",
  quads: "Cuádriceps",
  hamstrings: "Isquios",
  glutes: "Glúteos",
  abs: "Abs",
  "abs-lower": "Abs inferior",
  "abs-oblique": "Oblicuos",
  brachialis: "Braquial",
  forearm: "Antebrazo",
  "back-traps": "Trapecio",
  "full-body": "Cuerpo entero",
};

const SESSION_LABELS: Record<string, string> = {
  "upper-push": "D1 Upper Push",
  "upper-pull": "D2 Upper Pull",
  "upper-mixed-legs": "D3 Mixed + Legs",
  other: "Otro",
};

export default async function Dashboard() {
  await requireAuth();
  const d = await getDashboard();

  const today = new Date();
  const dayName = format(today, "EEEE d 'de' MMMM", { locale: es });

  const sleepDelta = d.avgSleep7d != null && d.avgSleep7d < 7;
  const kcalPct = d.todayKcal && d.activePlan ? (d.todayKcal.kcal_total / d.activePlan.kcal_target_kcal) * 100 : 0;
  const proteinPct =
    d.todayKcal && d.activePlan ? (d.todayKcal.protein_total / d.activePlan.protein_target_g) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-sm text-neutral-500 capitalize">{dayName}</p>
          <h1 className="text-2xl font-bold mt-1">Tu día con Sensei</h1>
        </div>
        {d.activePlan && (
          <div className="text-right text-xs text-neutral-500">
            <p className="font-medium text-neutral-300">{d.activePlan.name}</p>
            <p>Plan activo · semana ?? de {d.activePlan.weeks}</p>
          </div>
        )}
      </div>

      <section>
        <h2 className="section-title">Indicadores</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="kpi-card">
            <p className="kpi-label">Peso último</p>
            <p className="kpi-value">{d.lastWeight ? `${d.lastWeight.weight_kg} kg` : "—"}</p>
            <p className="kpi-delta delta-neutral">
              {d.lastWeight ? format(parseISO(d.lastWeight.date), "d MMM", { locale: es }) : "Sin datos aún"}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Sueño media 7d</p>
            <p className="kpi-value">{d.avgSleep7d != null ? `${d.avgSleep7d.toFixed(1)} h` : "—"}</p>
            <p className={`kpi-delta ${sleepDelta ? "delta-bad" : "delta-good"}`}>
              {sleepDelta ? "⚠ Bajo: target ≥7 h" : d.avgSleep7d != null ? "OK" : "Sin datos aún"}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Kcal hoy</p>
            <p className="kpi-value">
              {d.todayKcal ? `${Math.round(d.todayKcal.kcal_total)}` : "0"}
              {d.activePlan && <span className="text-base text-neutral-500"> / {d.activePlan.kcal_target_kcal}</span>}
            </p>
            <p className={`kpi-delta ${kcalPct > 110 ? "delta-bad" : kcalPct < 50 && new Date().getHours() > 18 ? "delta-bad" : "delta-neutral"}`}>
              {kcalPct.toFixed(0)}% del target
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Proteína hoy</p>
            <p className="kpi-value">
              {d.todayKcal ? `${Math.round(d.todayKcal.protein_total)} g` : "0 g"}
              {d.activePlan && <span className="text-base text-neutral-500"> / {d.activePlan.protein_target_g}</span>}
            </p>
            <p className={`kpi-delta ${proteinPct < 70 && new Date().getHours() > 18 ? "delta-bad" : "delta-neutral"}`}>
              {proteinPct.toFixed(0)}% del target
            </p>
          </div>
        </div>
      </section>

      {d.weekSetsByMuscle.length > 0 && (
        <section>
          <h2 className="section-title">Volumen esta semana por grupo muscular</h2>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
            <div className="space-y-2">
              {d.weekSetsByMuscle.slice(0, 10).map((m) => {
                const max = Math.max(...d.weekSetsByMuscle.map((x) => x.effective_sets));
                const pct = (m.effective_sets / max) * 100;
                return (
                  <div key={m.primary_muscle} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-neutral-400">
                      {MUSCLE_LABELS[m.primary_muscle] || m.primary_muscle}
                    </span>
                    <div className="flex-1 h-6 bg-[#1a1a1a] rounded overflow-hidden relative">
                      <div className="h-full bg-[#21D177]/70" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-12 text-right text-sm tabular-nums">{m.effective_sets}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {d.activeInjuries.length > 0 && (
        <section>
          <h2 className="section-title text-[#E95A0C]">⚠ Lesiones activas</h2>
          <div className="rounded-2xl border border-[#E95A0C]/40 bg-[#E95A0C]/5 p-4">
            <ul className="text-sm space-y-1">
              {d.activeInjuries.map((i, idx) => (
                <li key={idx}>
                  <span className="font-medium">{i.region}</span> · severidad {i.severity}/10
                  {i.restrictions && <span className="text-neutral-400"> · {i.restrictions}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Últimas sesiones</h2>
        {d.recentSessions.length > 0 ? (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>RPE</th>
                </tr>
              </thead>
              <tbody>
                {d.recentSessions.map((s) => (
                  <tr key={s.id}>
                    <td>{format(parseISO(s.date), "d MMM", { locale: es })}</td>
                    <td>{SESSION_LABELS[s.type] || s.type}</td>
                    <td>{s.rpe_global ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/historial" className="text-xs text-[#21D177] mt-3 inline-block hover:underline">
              Ver historial completo →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            Aún no hay sesiones registradas. Escríbele al bot de Telegram cuando entrenes.
          </p>
        )}
      </section>
    </div>
  );
}

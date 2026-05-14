import { requireAuth } from "@/lib/auth";
import { getDashboard, getLatestReports } from "@/lib/queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { WeightChart, VolumeBarChart } from "@/components/Charts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Pecho",
  "chest-upper": "Pecho sup.",
  "chest-lower": "Pecho inf.",
  "back-lats": "Espalda lats",
  "back-mid": "Espalda media",
  "delt-anterior": "Hombro ant.",
  "delt-lateral": "Hombro lat.",
  "delt-posterior": "Hombro post.",
  triceps: "Tríceps",
  biceps: "Bíceps",
  quads: "Cuádriceps",
  hamstrings: "Isquios",
  glutes: "Glúteos",
  abs: "Abs",
  "abs-lower": "Abs inf.",
  "abs-oblique": "Oblicuos",
  brachialis: "Braquial",
  forearm: "Antebrazo",
  "back-traps": "Trapecio",
  "full-body": "Cuerpo entero",
};

const VOLUME_TARGETS: Record<string, number> = {
  chest: 16,
  "delt-lateral": 16,
  "delt-posterior": 12,
  triceps: 12,
  biceps: 12,
  "back-lats": 14,
  "back-mid": 14,
  quads: 6,
  hamstrings: 4,
  abs: 14,
};

const SESSION_LABELS: Record<string, string> = {
  "upper-push": "D1 Push",
  "upper-pull": "D2 Pull",
  "upper-mixed-legs": "D3 Mixed",
  other: "Otro",
};

export default async function Dashboard() {
  await requireAuth();
  const d = await getDashboard();
  const reports = await getLatestReports(2);

  const today = new Date();
  const dayName = format(today, "EEEE d 'de' MMMM", { locale: es });
  const sleepDelta = d.avgSleep7d != null && d.avgSleep7d < 7;
  const kcalPct = d.todayKcal && d.activePlan ? (d.todayKcal.kcal_total / d.activePlan.kcal_target_kcal) * 100 : 0;
  const proteinPct =
    d.todayKcal && d.activePlan ? (d.todayKcal.protein_total / d.activePlan.protein_target_g) * 100 : 0;

  const volumeChartData = d.weekSetsByMuscle.slice(0, 12).map((m) => ({
    muscle: MUSCLE_LABELS[m.primary_muscle] || m.primary_muscle,
    sets: m.effective_sets,
    targetKey: m.primary_muscle,
  }));
  const targetMap: Record<string, number> = {};
  volumeChartData.forEach((d) => {
    const t = VOLUME_TARGETS[d.targetKey];
    if (t) targetMap[d.muscle] = t;
  });

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
            <p>Plan activo · target {d.activePlan.kcal_target_kcal} kcal / {d.activePlan.protein_target_g} P</p>
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
            <p className={`kpi-delta ${kcalPct > 110 ? "delta-bad" : "delta-neutral"}`}>
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

      <section>
        <h2 className="section-title">Apple Watch — últimos 7 días</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="kpi-card">
            <p className="kpi-label">HRV media 7d</p>
            <p className="kpi-value">{d.avgHrv7d != null ? `${d.avgHrv7d.toFixed(0)} ms` : "—"}</p>
            <p className={`kpi-delta ${d.avgHrv7d != null && d.avgHrv7d < 40 ? "delta-bad" : "delta-neutral"}`}>
              {d.avgHrv7d != null && d.avgHrv7d < 40 ? "Estrés / mala recuperación" : "Variabilidad cardiaca"}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">FC reposo 7d</p>
            <p className="kpi-value">{d.avgRhr7d != null ? `${d.avgRhr7d.toFixed(0)} bpm` : "—"}</p>
            <p className="kpi-delta delta-neutral">Frecuencia cardiaca en reposo</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Pasos hoy</p>
            <p className="kpi-value">{d.todaySteps != null ? d.todaySteps.toLocaleString("es-ES") : "—"}</p>
            <p className="kpi-delta delta-neutral">
              {d.todayDistance != null ? `${d.todayDistance.toFixed(2)} km` : "—"}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Calorías activas hoy</p>
            <p className="kpi-value">{d.todayActiveKcal != null ? d.todayActiveKcal : "—"}</p>
            <p className="kpi-delta delta-neutral">
              {d.todayExerciseMin != null ? `${d.todayExerciseMin} min ejercicio` : "—"}
            </p>
          </div>
        </div>

        {d.appleWatch7d.length > 0 && (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4 overflow-x-auto">
            <table className="data-table text-xs min-w-full">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>HRV</th>
                  <th>FC reposo</th>
                  <th>Sueño</th>
                  <th>Pasos</th>
                  <th>Km</th>
                  <th>Kcal act.</th>
                  <th>Min ejercicio</th>
                  <th>De pie (h)</th>
                  <th>Pisos</th>
                </tr>
              </thead>
              <tbody>
                {d.appleWatch7d.map((r) => (
                  <tr key={r.date}>
                    <td>{format(parseISO(r.date), "d MMM", { locale: es })}</td>
                    <td>{r.hrv_ms ?? "—"}</td>
                    <td>{r.resting_hr ?? "—"}</td>
                    <td>{r.sleep_h != null ? `${r.sleep_h} h` : "—"}</td>
                    <td>{r.steps?.toLocaleString("es-ES") ?? "—"}</td>
                    <td>{r.distance_km != null ? r.distance_km.toFixed(2) : "—"}</td>
                    <td>{r.active_kcal ?? "—"}</td>
                    <td>{r.exercise_minutes ?? "—"}</td>
                    <td>{r.stand_hours ?? "—"}</td>
                    <td>{r.flights_climbed ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-neutral-500 mt-2">
              Datos del Apple Watch, sincronización automática diaria.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Tendencia de peso (últimos 90 días)</h2>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
          <WeightChart data={d.weightSeries} />
        </div>
      </section>

      <section>
        <h2 className="section-title">Volumen esta semana por grupo muscular</h2>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
          <VolumeBarChart data={volumeChartData} targetByMuscle={targetMap} />
          <p className="text-xs text-neutral-500 mt-2">
            Verde = en rango. Naranja = bajo MEV o sobre MRV. Targets basados en Israetel RP.
          </p>
        </div>
      </section>

      {d.activeInjuries.length > 0 && (
        <section>
          <h2 className="section-title text-[#E95A0C]">🔴 Lesiones activas</h2>
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

      {reports.length > 0 && (
        <section>
          <h2 className="section-title">Últimos reportes Sensei</h2>
          <div className="space-y-3">
            {reports.map((r: any) => (
              <details key={r.id} className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  {r.period_type === "weekly" ? "📊 Semanal" : "📋 Diario"} · {r.period_start}
                  {r.period_type === "weekly" && ` → ${r.period_end}`}
                </summary>
                <div className="mt-3 text-sm whitespace-pre-wrap text-neutral-300">{r.summary_md}</div>
              </details>
            ))}
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
            Aún no hay sesiones. Escríbele al bot de Telegram cuando entrenes.
          </p>
        )}
      </section>
    </div>
  );
}

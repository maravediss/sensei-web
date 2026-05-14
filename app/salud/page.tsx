import { requireAuth } from "@/lib/auth";
import { getHealthTrend } from "@/lib/queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { HealthTrendChart, SleepBarChart, StepsBarChart } from "@/components/Charts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SaludPage() {
  await requireAuth();
  const rows = await getHealthTrend(30);

  const hrvSeries = rows
    .filter((r: any) => r.hrv_ms != null)
    .map((r: any) => ({ date: r.date.substring(5), y: Number(r.hrv_ms) }));
  const rhrSeries = rows
    .filter((r: any) => r.resting_hr != null)
    .map((r: any) => ({ date: r.date.substring(5), y: Number(r.resting_hr) }));
  const sleepSeries = rows
    .filter((r: any) => r.sleep_h != null)
    .map((r: any) => ({ date: r.date.substring(5), y: Number(r.sleep_h) }));
  const stepsSeries = rows
    .filter((r: any) => r.steps != null)
    .map((r: any) => ({ date: r.date.substring(5), y: Number(r.steps) }));
  const kcalSeries = rows
    .filter((r: any) => r.active_kcal != null)
    .map((r: any) => ({ date: r.date.substring(5), y: Number(r.active_kcal) }));

  // Averages
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const avgHrv = avg(hrvSeries.map((r) => r.y));
  const avgRhr = avg(rhrSeries.map((r) => r.y));
  const avgSleep = avg(sleepSeries.map((r) => r.y));
  const avgSteps = avg(stepsSeries.map((r) => r.y));
  const totalKcalActive = kcalSeries.reduce((a, b) => a + b.y, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Salud · últimos 30 días</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Datos del Apple Watch sincronizados automáticamente desde Apple Salud.
        </p>
      </div>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="kpi-card">
            <p className="kpi-label">HRV media</p>
            <p className="kpi-value">{avgHrv != null ? `${avgHrv.toFixed(0)} ms` : "—"}</p>
            <p className="kpi-delta delta-neutral">Variabilidad cardiaca</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">FC reposo media</p>
            <p className="kpi-value">{avgRhr != null ? `${avgRhr.toFixed(0)} bpm` : "—"}</p>
            <p className="kpi-delta delta-neutral">En reposo</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Sueño medio</p>
            <p className="kpi-value">{avgSleep != null ? `${avgSleep.toFixed(1)} h` : "—"}</p>
            <p className={`kpi-delta ${avgSleep != null && avgSleep < 7 ? "delta-bad" : "delta-good"}`}>
              {avgSleep != null && avgSleep < 7 ? "Bajo el target 7h" : "OK"}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Pasos medios/día</p>
            <p className="kpi-value">{avgSteps != null ? Math.round(avgSteps).toLocaleString("es-ES") : "—"}</p>
            <p className="kpi-delta delta-neutral">
              {avgSteps != null && avgSteps > 7000 ? "Activo" : "Sedentario"}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Kcal activas total</p>
            <p className="kpi-value">{totalKcalActive ? Math.round(totalKcalActive).toLocaleString("es-ES") : "—"}</p>
            <p className="kpi-delta delta-neutral">30 días</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Variabilidad cardiaca (HRV)</h2>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
          <HealthTrendChart data={hrvSeries} color="#21D177" unit="ms" />
          <p className="text-xs text-neutral-500 mt-2">
            HRV: rango sano adulto 30-80 ms. Bajadas {">"}15% vs media indican estrés o mala recuperación.
          </p>
        </div>
      </section>

      <section>
        <h2 className="section-title">Frecuencia cardiaca en reposo</h2>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
          <HealthTrendChart data={rhrSeries} color="#E95A0C" unit="bpm" />
          <p className="text-xs text-neutral-500 mt-2">
            FC reposo: rango deportivo 50-65 bpm. Subidas sostenidas pueden indicar sobreentrenamiento.
          </p>
        </div>
      </section>

      <section>
        <h2 className="section-title">Sueño</h2>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
          <SleepBarChart data={sleepSeries} />
          <p className="text-xs text-neutral-500 mt-2">
            Target 7h+. Por debajo de 6h la síntesis proteica baja un 20% y la sensibilidad a insulina cae.
          </p>
        </div>
      </section>

      <section>
        <h2 className="section-title">Actividad diaria (pasos)</h2>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
          <StepsBarChart data={stepsSeries} />
          <p className="text-xs text-neutral-500 mt-2">
            Pasos diarios. Línea de referencia: 7.500 (NEAT objetivo para 2.290 kcal TDEE).
          </p>
        </div>
      </section>

      <section>
        <h2 className="section-title">Detalle día a día</h2>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4 overflow-x-auto">
          <table className="data-table text-xs">
            <thead>
              <tr>
                <th>Día</th>
                <th>Peso</th>
                <th>HRV</th>
                <th>FC rep</th>
                <th>Sueño</th>
                <th>Pasos</th>
                <th>Km</th>
                <th>Kcal act.</th>
                <th>Ej. min</th>
                <th>De pie</th>
                <th>Pisos</th>
                <th>FC andando</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice().reverse().map((r: any) => (
                <tr key={r.date}>
                  <td>{format(parseISO(r.date), "d MMM", { locale: es })}</td>
                  <td>{r.weight_kg ? `${r.weight_kg} kg` : "—"}</td>
                  <td>{r.hrv_ms ?? "—"}</td>
                  <td>{r.resting_hr ?? "—"}</td>
                  <td>{r.sleep_h != null ? `${r.sleep_h} h` : "—"}</td>
                  <td>{r.steps != null ? Number(r.steps).toLocaleString("es-ES") : "—"}</td>
                  <td>{r.distance_km != null ? Number(r.distance_km).toFixed(2) : "—"}</td>
                  <td>{r.active_kcal ?? "—"}</td>
                  <td>{r.exercise_minutes ?? "—"}</td>
                  <td>{r.stand_hours ?? "—"}</td>
                  <td>{r.flights_climbed ?? "—"}</td>
                  <td>{r.walking_hr_avg ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import { getSessionDetail } from "@/lib/queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const { session, sets } = await getSessionDetail(id);

  if (!session) return <p>Sesión no encontrada</p>;

  // group sets by exercise
  const byExercise: Record<string, typeof sets> = {};
  for (const s of sets) {
    const key = (s as any).exercise_slug as string;
    if (!byExercise[key]) byExercise[key] = [];
    byExercise[key].push(s);
  }

  return (
    <div className="space-y-6">
      <Link href="/historial" className="text-xs text-neutral-400 hover:text-white">
        ← volver al historial
      </Link>
      <h1 className="text-2xl font-bold">
        Sesión · {format(parseISO(session.date), "d MMM yyyy", { locale: es })} · {session.type}
      </h1>
      <div className="flex flex-wrap gap-3 text-sm text-neutral-400">
        {session.rpe_global != null && <span>RPE global {session.rpe_global}/10</span>}
        {session.sleep_h != null && <span>Sueño previo {session.sleep_h}h</span>}
        {session.energy_1_10 != null && <span>Energía {session.energy_1_10}/10</span>}
      </div>
      {session.notes && <p className="text-sm">{session.notes}</p>}

      <div className="space-y-4">
        {Object.entries(byExercise).map(([slug, setsArr]) => (
          <div key={slug} className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
            <h2 className="font-medium mb-2">{slug}</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serie</th>
                  <th>Reps</th>
                  <th>Peso</th>
                  <th>RIR</th>
                  <th>RPE</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {setsArr.map((s: any) => (
                  <tr key={s.id}>
                    <td>{s.set_n}</td>
                    <td>{s.reps ?? "—"}</td>
                    <td>{s.weight_kg ? `${s.weight_kg} kg` : "—"}</td>
                    <td>{s.rir ?? "—"}</td>
                    <td>{s.rpe ?? "—"}</td>
                    <td className="text-neutral-400">{s.notes || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

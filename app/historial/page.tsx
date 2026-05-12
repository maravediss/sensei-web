import { requireAuth } from "@/lib/auth";
import { getHistory } from "@/lib/queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SESSION_LABELS: Record<string, string> = {
  "upper-push": "D1 Push",
  "upper-pull": "D2 Pull",
  "upper-mixed-legs": "D3 Mixed",
  other: "Otro",
};

export default async function Historial() {
  await requireAuth();
  const sessions = await getHistory(80);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historial de sesiones</h1>
      {sessions.length === 0 ? (
        <p className="text-sm text-neutral-500">Aún no hay sesiones registradas.</p>
      ) : (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>RPE global</th>
                <th>Notas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{format(parseISO(s.date), "d MMM yyyy", { locale: es })}</td>
                  <td>{SESSION_LABELS[s.type] || s.type}</td>
                  <td>{s.rpe_global ?? "—"}</td>
                  <td className="text-neutral-400">{s.notes || ""}</td>
                  <td>
                    <Link href={`/historial/${s.id}`} className="text-xs text-[#21D177] hover:underline">
                      ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

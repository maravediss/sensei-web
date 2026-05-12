import { requireAuth } from "@/lib/auth";
import { getMealsToday } from "@/lib/queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

const MEAL_LABEL: Record<string, string> = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
  snack: "Snack",
  "peri-workout": "Peri-entreno",
};

export default async function Comida() {
  await requireAuth();
  const meals = await getMealsToday();

  const totals = meals.reduce(
    (acc, m: any) => ({
      kcal: acc.kcal + Number(m.kcal || 0),
      p: acc.p + Number(m.protein_g || 0),
      c: acc.c + Number(m.carbs_g || 0),
      f: acc.f + Number(m.fat_g || 0),
    }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );

  const target = { kcal: 2290, p: 154, c: 261, f: 70 };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Comida de hoy</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Kcal" value={totals.kcal} target={target.kcal} unit="kcal" />
        <Stat label="Proteína" value={totals.p} target={target.p} unit="g" />
        <Stat label="Carbo" value={totals.c} target={target.c} unit="g" />
        <Stat label="Grasa" value={totals.f} target={target.f} unit="g" />
      </div>

      {meals.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aún no has registrado comidas hoy. Mándale foto al bot o cuéntale por texto.
        </p>
      ) : (
        <div className="space-y-3">
          {meals.map((m: any) => (
            <div key={m.id} className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium">
                  {MEAL_LABEL[m.type] || m.type || "Toma"} · {format(parseISO(m.ts), "HH:mm")}
                </h3>
                <span className="text-sm text-[#21D177]">
                  {Math.round(Number(m.kcal || 0))} kcal · {Math.round(Number(m.protein_g || 0))}P
                </span>
              </div>
              {Array.isArray(m.items) && m.items.length > 0 && (
                <ul className="text-sm text-neutral-400 mt-2 space-y-1">
                  {m.items.map((it: any, i: number) => (
                    <li key={i}>
                      {it.food} · {it.grams}g · {it.kcal} kcal · {it.p}P/{it.c}C/{it.f}F
                    </li>
                  ))}
                </ul>
              )}
              {m.notes && <p className="text-xs text-neutral-500 mt-2">{m.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  const pct = (value / target) * 100;
  return (
    <div className="kpi-card">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">
        {Math.round(value)}
        <span className="text-base text-neutral-500"> / {target} {unit}</span>
      </p>
      <div className="mt-2 h-2 bg-[#1a1a1a] rounded overflow-hidden">
        <div
          className={`h-full ${pct > 110 ? "bg-[#E95A0C]" : "bg-[#21D177]"}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className={`kpi-delta ${pct < 50 && new Date().getHours() > 18 ? "delta-bad" : "delta-neutral"}`}>
        {pct.toFixed(0)}%
      </p>
    </div>
  );
}

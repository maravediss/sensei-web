import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { format, parseISO, differenceInWeeks } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function Plan() {
  await requireAuth();

  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("status", "active")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) return <p>No hay plan activo.</p>;

  const weekN = Math.max(1, differenceInWeeks(new Date(), parseISO(plan.start_date)) + 1);

  const sessions = [
    {
      day: "D1 — UPPER PUSH",
      exercises: [
        ["Press banca con barra", "4 × 5-7 reps · 62.5 kg · RIR 2 · descanso 2-3 min"],
        ["Press inclinado mancuernas", "3 × 8-10 · RIR 2 · descanso 90s"],
        ["Press militar mancuernas", "3 × 8-10 · RIR 2 · descanso 90s"],
        ["Elevaciones laterales mancuernas", "4 × 12-15 · RIR 1 · descanso 60s"],
        ["Fondos o tríceps polea", "3 × 10-12 · RIR 1 · descanso 75s"],
        ["Plancha + Pallof press", "3 × 45s + 3 × 12 cada lado"],
      ],
    },
    {
      day: "D2 — UPPER PULL",
      exercises: [
        ["Dominadas", "4 × AMRAP · RIR 1 (si <6, jalón al pecho 4×8)"],
        ["Remo con barra", "4 × 6-8 · 60 kg · RIR 2 · descanso 2 min"],
        ["Remo polea sentado", "3 × 10-12 · RIR 1"],
        ["Face pull", "4 × 15-20 · RIR 0 · salud hombro"],
        ["Curl barra EZ", "3 × 8-10 · RIR 1"],
        ["Curl hammer", "2 × 12 · RIR 1"],
        ["Hanging leg raise", "3 × 8-12"],
      ],
    },
    {
      day: "D3 — UPPER MIXED + LEGS MIN",
      exercises: [
        ["Press inclinado con barra", "4 × 6-8 · RIR 2 · descanso 2 min"],
        ["Chinup (dominadas supinas)", "3 × AMRAP · RIR 1"],
        ["Press militar con barra", "3 × 6-8 · RIR 2"],
        ["Squat trasero", "3 × 6-8 · RIR 2-3 · mantenimiento NO al fallo"],
        ["Elevaciones laterales polea", "3 × 15 (última drop set) · RIR 0"],
        ["Tríceps polea sobre cabeza", "3 × 10-12 · RIR 1"],
        ["Cable crunch", "3 × 12-15 cargado"],
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">{plan.name}</h1>
          <p className="text-sm text-neutral-500">
            Semana {weekN} de {plan.weeks} · Empezado {format(parseISO(plan.start_date), "d MMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="text-right text-xs text-neutral-500">
          <p>Target: {plan.kcal_target_kcal} kcal / {plan.protein_target_g} P</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-4">
        <h2 className="font-medium mb-2">Estructura del mesociclo</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Semanas</th>
              <th>Fase</th>
              <th>Objetivo</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1-4</td><td>Acumulación 1</td><td>+1 set/semana en pecho/hombros/brazos</td></tr>
            <tr><td>5-7</td><td>Intensificación</td><td>Subir cargas manteniendo volumen</td></tr>
            <tr><td>8</td><td><span className="text-[#E95A0C]">Deload</span></td><td>-40 % volumen / -20 % carga</td></tr>
            <tr><td>9-11</td><td>Acumulación 2</td><td>Re-acumular desde MEV+2</td></tr>
            <tr><td>12</td><td>Test + foto</td><td>1RM submáximo + medidas + fotos progreso</td></tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        {sessions.map((s) => (
          <div key={s.day} className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-5">
            <h2 className="font-semibold text-[#21D177] mb-3">{s.day}</h2>
            <ul className="space-y-2 text-sm">
              {s.exercises.map(([name, detail]) => (
                <li key={name}>
                  <span className="font-medium">{name}</span>
                  <span className="text-neutral-400"> — {detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

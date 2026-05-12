import { supabase } from "./supabase";
import { startOfWeek, formatISO, subDays } from "date-fns";

export type DashboardData = {
  lastWeight: { weight_kg: number; date: string } | null;
  avgSleep7d: number | null;
  weekSetsByMuscle: { primary_muscle: string; effective_sets: number }[];
  todayKcal: { kcal_total: number; protein_total: number; carbs_total: number; fat_total: number } | null;
  activeInjuries: { region: string; severity: number; restrictions: string | null }[];
  activePlan: { name: string; start_date: string; weeks: number; kcal_target_kcal: number; protein_target_g: number } | null;
  recentSessions: { id: string; date: string; type: string; rpe_global: number | null }[];
  weightSeries: { date: string; weight: number }[];
};

export async function getDashboard(): Promise<DashboardData> {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const today = formatISO(now, { representation: "date" });

  const { data: weightRow } = await supabase
    .from("body_metrics")
    .select("weight_kg, date")
    .not("weight_kg", "is", null)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: sleepRows } = await supabase
    .from("body_metrics")
    .select("sleep_h, date")
    .not("sleep_h", "is", null)
    .gte("date", formatISO(subDays(now, 7), { representation: "date" }))
    .order("date", { ascending: false });
  const avgSleep7d =
    sleepRows && sleepRows.length > 0
      ? sleepRows.reduce((a, b) => a + Number(b.sleep_h || 0), 0) / sleepRows.length
      : null;

  const { data: volRows } = await supabase
    .from("v_weekly_volume_by_muscle")
    .select("primary_muscle, effective_sets, week_start")
    .gte("week_start", formatISO(weekStart, { representation: "date" }))
    .order("effective_sets", { ascending: false });

  const { data: nutritionRow } = await supabase
    .from("v_daily_nutrition")
    .select("kcal_total, protein_total, carbs_total, fat_total")
    .eq("day", today)
    .maybeSingle();

  const { data: injuries } = await supabase
    .from("injuries")
    .select("region, severity, restrictions")
    .eq("status", "active");

  const { data: plan } = await supabase
    .from("plans")
    .select("name, start_date, weeks, kcal_target_kcal, protein_target_g")
    .eq("status", "active")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, date, type, rpe_global")
    .order("date", { ascending: false })
    .limit(5);

  const { data: weightHistory } = await supabase
    .from("body_metrics")
    .select("date, weight_kg")
    .not("weight_kg", "is", null)
    .gte("date", formatISO(subDays(now, 90), { representation: "date" }))
    .order("date", { ascending: true });

  return {
    lastWeight: weightRow ? { weight_kg: Number(weightRow.weight_kg), date: weightRow.date } : null,
    avgSleep7d,
    weekSetsByMuscle: (volRows || []).map((r) => ({
      primary_muscle: r.primary_muscle,
      effective_sets: Number(r.effective_sets),
    })),
    todayKcal: nutritionRow
      ? {
          kcal_total: Number(nutritionRow.kcal_total || 0),
          protein_total: Number(nutritionRow.protein_total || 0),
          carbs_total: Number(nutritionRow.carbs_total || 0),
          fat_total: Number(nutritionRow.fat_total || 0),
        }
      : null,
    activeInjuries: injuries || [],
    activePlan: plan
      ? {
          name: plan.name,
          start_date: plan.start_date,
          weeks: plan.weeks,
          kcal_target_kcal: Number(plan.kcal_target_kcal),
          protein_target_g: Number(plan.protein_target_g),
        }
      : null,
    recentSessions: (sessions || []).map((s) => ({
      id: s.id,
      date: s.date,
      type: s.type,
      rpe_global: s.rpe_global,
    })),
    weightSeries: (weightHistory || []).map((r) => ({
      date: String(r.date).substring(5),
      weight: Number(r.weight_kg),
    })),
  };
}

export async function getHistory(limit = 50) {
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, date, type, rpe_global, notes")
    .order("date", { ascending: false })
    .limit(limit);
  return sessions || [];
}

export async function getSessionDetail(id: string) {
  const { data: session } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle();
  const { data: sets } = await supabase
    .from("exercise_sets")
    .select("*")
    .eq("session_id", id)
    .order("set_n", { ascending: true });
  return { session, sets: sets || [] };
}

export async function getMealsToday() {
  const today = formatISO(new Date(), { representation: "date" });
  const { data } = await supabase
    .from("meals")
    .select("*")
    .gte("ts", today + "T00:00:00")
    .order("ts", { ascending: true });
  return data || [];
}

export async function getRecentMessages(limit = 30) {
  const { data } = await supabase
    .from("messages_log")
    .select("id, direction, content, ts, model_used, intent")
    .order("ts", { ascending: false })
    .limit(limit);
  return (data || []).reverse();
}

export async function getExerciseProgression(slug: string, limit = 20) {
  const { data } = await supabase
    .from("exercise_sets")
    .select("session_id, weight_kg, reps, rir, sensei_sessions:session_id(date)")
    .eq("exercise_slug", slug)
    .not("is_warmup", "eq", true)
    .order("session_id", { ascending: false })
    .limit(limit * 5);
  // Group by session, take best top set
  const bySession: Record<string, { date: string; weight: number; reps: number }> = {};
  for (const s of data || []) {
    const sess = (s as any).sensei_sessions;
    if (!sess?.date) continue;
    const w = Number(s.weight_kg || 0);
    if (!bySession[s.session_id] || w > bySession[s.session_id].weight) {
      bySession[s.session_id] = { date: sess.date, weight: w, reps: Number(s.reps || 0) };
    }
  }
  return Object.values(bySession)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-limit)
    .map((d) => ({ ...d, date: d.date.substring(5) }));
}

export async function getLatestReports(limit = 5) {
  const { data } = await supabase
    .from("reports")
    .select("id, period_type, period_start, period_end, summary_md, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

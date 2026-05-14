"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";

type Point = { x: string; y: number };

export function LineSpark({ data, color = "#21D177", height = 80 }: { data: Point[]; color?: string; height?: number }) {
  if (!data?.length) return <div className="text-xs text-neutral-500">Sin datos</div>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  if (!data?.length) return <p className="text-xs text-neutral-500">Sin datos de peso aún. Registra con /peso 70.5 en Telegram.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis dataKey="date" stroke="#666" fontSize={11} />
        <YAxis domain={["auto", "auto"]} stroke="#666" fontSize={11} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#F0F0F0" }}
          labelStyle={{ color: "#888" }}
        />
        <Line type="monotone" dataKey="weight" stroke="#21D177" strokeWidth={2.5} dot={{ fill: "#21D177", r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

type DateSeries = { date: string; y: number };

export function HealthTrendChart({
  data,
  color = "#21D177",
  unit = "",
}: {
  data: DateSeries[];
  color?: string;
  unit?: string;
}) {
  if (!data?.length) return <p className="text-xs text-neutral-500">Sin datos en últimos 30 días.</p>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis dataKey="date" stroke="#666" fontSize={10} />
        <YAxis domain={["auto", "auto"]} stroke="#666" fontSize={10} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#F0F0F0" }}
          formatter={(v: any) => [`${v} ${unit}`, ""]}
        />
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={{ fill: color, r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SleepBarChart({ data }: { data: DateSeries[] }) {
  if (!data?.length) return <p className="text-xs text-neutral-500">No hay registros de sueño. Duerme con el Apple Watch puesto.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis dataKey="date" stroke="#666" fontSize={10} />
        <YAxis domain={[0, 10]} stroke="#666" fontSize={10} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#F0F0F0" }}
          formatter={(v: any) => [`${v} h`, "Sueño"]}
        />
        <Bar dataKey="y" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.y < 6 ? "#E95A0C" : d.y < 7 ? "#FFC107" : "#21D177"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StepsBarChart({ data }: { data: DateSeries[] }) {
  if (!data?.length) return <p className="text-xs text-neutral-500">Sin datos de pasos.</p>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis dataKey="date" stroke="#666" fontSize={10} />
        <YAxis stroke="#666" fontSize={10} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#F0F0F0" }}
          formatter={(v: any) => [Number(v).toLocaleString("es-ES"), "Pasos"]}
        />
        <Bar dataKey="y" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.y < 5000 ? "#E95A0C" : d.y < 7500 ? "#FFC107" : "#21D177"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VolumeBarChart({
  data,
  targetByMuscle,
}: {
  data: { muscle: string; sets: number }[];
  targetByMuscle?: Record<string, number>;
}) {
  if (!data?.length) return <p className="text-xs text-neutral-500">Aún no hay volumen registrado esta semana.</p>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis type="number" stroke="#666" fontSize={11} />
        <YAxis dataKey="muscle" type="category" stroke="#888" fontSize={11} width={80} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#F0F0F0" }}
        />
        <Bar dataKey="sets" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => {
            const target = targetByMuscle?.[d.muscle];
            const color =
              target == null
                ? "#21D177"
                : d.sets < target * 0.6
                ? "#E95A0C"
                : d.sets > target * 1.3
                ? "#E95A0C"
                : "#21D177";
            return <Cell key={i} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ExerciseProgressionChart({
  data,
}: {
  data: { date: string; weight: number; reps: number }[];
}) {
  if (!data?.length) return <p className="text-xs text-neutral-500">Sin progresión registrada.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis dataKey="date" stroke="#666" fontSize={11} />
        <YAxis yAxisId="left" stroke="#21D177" fontSize={11} />
        <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={11} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#F0F0F0" }}
        />
        <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#21D177" strokeWidth={2.5} dot={{ r: 3 }} name="Peso (kg)" />
        <Line yAxisId="right" type="monotone" dataKey="reps" stroke="#888" strokeWidth={1.5} dot={{ r: 2 }} name="Reps max" />
      </LineChart>
    </ResponsiveContainer>
  );
}

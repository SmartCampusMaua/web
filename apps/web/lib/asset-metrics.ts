import type { Asset, SeriesPoint } from "@/lib/assets/types";

export interface MetricDef {
  label: string;
  unit: string;
  color: string;
  /** level: valor instantâneo (linha). cumulative: contador que só cresce (barras por hora). */
  mode: "level" | "cumulative";
  digits: number;
}

export const METRICS: Record<string, MetricDef> = {
  voltage_u_ll_avg: { label: "Tensão", unit: "V", color: "#a78bfa", mode: "level", digits: 1 },
  current_i_avg: { label: "Corrente", unit: "A", color: "#fbbf24", mode: "level", digits: 1 },
  power_factor: { label: "Fator de potência", unit: "", color: "#34d399", mode: "level", digits: 2 },
  // ASSUNÇÃO: energy_a_plus é um contador acumulado em kWh. Ajuste a unidade aqui se for Wh.
  energy_a_plus: { label: "Consumo de energia", unit: "kWh", color: "#fb7185", mode: "cumulative", digits: 1 },
  water_level: { label: "Nível da água", unit: "m", color: "#38bdf8", mode: "level", digits: 2 },
  energy_a_minus: { label: "Energia exportada", unit: "kWh", color: "#2dd4bf", mode: "cumulative", digits: 1 },
  // ASSUNÇÃO: pulse_count é o contador do hidrômetro; a unidade real (litros/pulso) não está na planilha.
  pulse_count: { label: "Consumo (hidrômetro)", unit: "pulsos", color: "#22d3ee", mode: "cumulative", digits: 0 },
  battery_level: { label: "Bateria", unit: "%", color: "#94a3b8", mode: "level", digits: 0 },
};

export const metricFor = (sensorType: string): MetricDef =>
  METRICS[sensorType] ?? { label: sensorType, unit: "", color: "#64748b", mode: "level", digits: 2 };

const ENERGY_SENSORS = ["voltage_u_ll_avg", "current_i_avg", "power_factor", "energy_a_plus", "energy_a_minus"];
const WATER_SENSORS = ["water_level", "pulse_count"];

/** Quais dashboards existem, a partir dos tipos de sensor (da API ou da planilha). */
export function dashboardsFromTypes(sensorTypes: string[]): string[] {
  const types = new Set(sensorTypes);
  const out: string[] = [];
  if (ENERGY_SENSORS.some((t) => types.has(t))) out.push("Energia");
  if (WATER_SENSORS.some((t) => types.has(t))) out.push("Água");
  const known = new Set([...ENERGY_SENSORS, ...WATER_SENSORS, "battery_level"]);
  if ([...types].some((t) => !known.has(t))) out.push("Outros");
  return out;
}

export const dashboardsOf = (asset: Asset) =>
  dashboardsFromTypes(asset.sensors.map((s) => s.type));

export function computeStats(points: SeriesPoint[]) {
  if (points.length === 0) return null;
  const values = points.map((p) => p.v);
  return {
    latest: points[points.length - 1],
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    /** total acumulado na janela (só faz sentido para contadores) */
    delta: values[values.length - 1] - values[0],
  };
}

const HOUR = 3_600_000;

/** Para contadores: diferença entre o último valor de cada hora e o da hora anterior. */
export function hourlyConsumption(points: SeriesPoint[]) {
  const lastPerHour = new Map<number, number>();
  for (const p of points) lastPerHour.set(Math.floor(p.t / HOUR) * HOUR, p.v);
  const hours = [...lastPerHour.entries()].sort((a, b) => a[0] - b[0]);
  return hours.slice(1).map(([hour, value], i) => ({
    hour,
    value: Math.max(0, value - hours[i][1]),
  }));
}

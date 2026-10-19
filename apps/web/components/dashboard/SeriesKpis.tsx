"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { computeStats, hourlyConsumption, metricFor } from "@/lib/asset-metrics";
import type { SensorSeries } from "@/lib/assets/types";

function Stat({ label, value, digits, unit }: { label: string; value: number; digits: number; unit: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-base font-bold text-gray-900">
        {value.toLocaleString("pt-BR", { maximumFractionDigits: digits })}{" "}
        <span className="text-xs font-normal text-gray-500">{unit}</span>
      </p>
    </div>
  );
}

function KpiCard({ series }: { series: SensorSeries }) {
  const m = metricFor(series.sensorType);
  const stats = computeStats(series.points);
  const cumulative = m.mode === "cumulative";
  const hourly = cumulative ? hourlyConsumption(series.points) : [];
  const config = { value: { label: `${m.unit} na hora`, color: m.color } } satisfies ChartConfig;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{m.label}</h3>
      {!stats ? (
        <p className="py-4 text-center text-xs italic text-gray-400">Sem dados</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {cumulative ? (
              <>
                <Stat label="No período" value={stats.delta} digits={m.digits} unit={m.unit} />
                <Stat label="Contador atual" value={stats.latest.v} digits={m.digits} unit={m.unit} />
              </>
            ) : (
              <>
                <Stat label="Atual" value={stats.latest.v} digits={m.digits} unit={m.unit} />
                <Stat label="Média" value={stats.avg} digits={m.digits} unit={m.unit} />
                <Stat label="Mínimo" value={stats.min} digits={m.digits} unit={m.unit} />
                <Stat label="Máximo" value={stats.max} digits={m.digits} unit={m.unit} />
              </>
            )}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Última leitura: {new Date(stats.latest.t).toLocaleString("pt-BR")}
          </p>
          {cumulative && hourly.length > 0 && (
            <ChartContainer config={config} className="aspect-auto mt-2 h-32 w-full">
              <BarChart data={hourly}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickMargin={6} minTickGap={24}
                  tickFormatter={(v: number) => new Date(v).toLocaleString("pt-BR", { hour: "2-digit" }) + "h"} />
                <YAxis width={40} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={3} />
              </BarChart>
            </ChartContainer>
          )}
        </>
      )}
    </section>
  );
}

/** Painel direito: indicadores e consumo por hora. Cumulativos primeiro. */
export function SeriesKpis({ series, loading }: { series: SensorSeries[] | null; loading: boolean }) {
  const ordered = [...(series ?? [])].sort(
    (a, b) =>
      Number(metricFor(b.sensorType).mode === "cumulative") -
      Number(metricFor(a.sensorType).mode === "cumulative")
  );
  return (
    <div className="space-y-3 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Indicadores</h2>
      {loading
        ? [0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />)
        : ordered.map((s) => <KpiCard key={s.sensorId} series={s} />)}
    </div>
  );
}

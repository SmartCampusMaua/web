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
import { cn } from "@/lib/utils";
import { CHART_DARK, GLASS_CARD, GRID_STROKE, TOOLTIP_DARK } from "./glass";

function Stat({ label, value, digits, unit, color }: {
  label: string; value: number; digits: number; unit: string; color: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-lg font-bold leading-tight text-white" style={{ textShadow: `0 0 14px ${color}66` }}>
        {value.toLocaleString("pt-BR", { maximumFractionDigits: digits })}{" "}
        <span className="text-xs font-normal text-slate-400">{unit}</span>
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
    <section className={GLASS_CARD}>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="size-2 rounded-full" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
        {m.label}
      </h3>
      {!stats ? (
        <p className="py-4 text-center text-xs italic text-slate-500">Sem dados</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {cumulative ? (
              <>
                <Stat label="No período" value={stats.delta} digits={m.digits} unit={m.unit} color={m.color} />
                <Stat label="Contador atual" value={stats.latest.v} digits={m.digits} unit={m.unit} color={m.color} />
              </>
            ) : (
              <>
                <Stat label="Atual" value={stats.latest.v} digits={m.digits} unit={m.unit} color={m.color} />
                <Stat label="Média" value={stats.avg} digits={m.digits} unit={m.unit} color={m.color} />
                <Stat label="Mínimo" value={stats.min} digits={m.digits} unit={m.unit} color={m.color} />
                <Stat label="Máximo" value={stats.max} digits={m.digits} unit={m.unit} color={m.color} />
              </>
            )}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Última leitura: {new Date(stats.latest.t).toLocaleString("pt-BR")}
          </p>
          {cumulative && hourly.length > 0 && (
            <ChartContainer config={config}
              className={cn("aspect-auto mt-2 h-32 w-full", "[&_.recharts-bar-rectangle]:drop-shadow-[0_0_5px_var(--color-value)]", CHART_DARK)}>
              <BarChart data={hourly}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tickMargin={6} minTickGap={24}
                  tickFormatter={(v: number) => new Date(v).toLocaleString("pt-BR", { hour: "2-digit" }) + "h"} />
                <YAxis width={40} axisLine={false} tickLine={false} />
                <ChartTooltip cursor={{ fill: "rgba(255,255,255,0.06)" }}
                  content={<ChartTooltipContent hideLabel className={TOOLTIP_DARK} />} />
                <Bar dataKey="value" fill="var(--color-value)" fillOpacity={0.85} radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </>
      )}
    </section>
  );
}

/** Painel direito: indicadores e consumo por hora. Cumulativos primeiro. */
export function SeriesKpis({ series, loading, error }: { series: SensorSeries[] | null; loading: boolean; error: boolean }) {
  const ordered = [...(series ?? [])].sort(
    (a, b) =>
      Number(metricFor(b.sensorType).mode === "cumulative") -
      Number(metricFor(a.sensorType).mode === "cumulative")
  );
  return (
    <div className="space-y-3 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">Indicadores</h2>
      {!loading && (error || ordered.length === 0) && (
        <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs italic text-slate-400">
          {error ? "Não foi possível carregar os dados." : "Sem dados para exibir."}
        </p>
      )}
      {loading
        ? [0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-white/10" />)
        : ordered.map((s) => <KpiCard key={s.sensorId} series={s} />)}
    </div>
  );
}

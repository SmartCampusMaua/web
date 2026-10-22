"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { dashboardsFromTypes, dashboardsOf, metricFor } from "@/lib/asset-metrics";
import { QUERY, type MapAsset, type SensorSeries } from "@/lib/assets/types";
import { cn } from "@/lib/utils";
import { CHART_DARK, GLASS_CARD, GRID_STROKE, TOOLTIP_DARK } from "./glass";

const fmtTick = (t: number) =>
  new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const fmtFull = (t: number) =>
  new Date(t).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

function LineCard({ series }: { series: SensorSeries }) {
  const m = metricFor(series.sensorType);
  const config = { v: { label: m.label, color: m.color } } satisfies ChartConfig;

  return (
    <section className={GLASS_CARD}>
      <h3 className="text-sm font-semibold text-slate-900">
        {m.label} {m.unit && <span className="font-normal text-slate-600">({m.unit})</span>}
      </h3>
      {series.points.length === 0 ? (
        <p className="py-8 text-center text-xs italic text-slate-600">Sem leituras neste período</p>
      ) : (
        <ChartContainer
          config={config}
          className={cn("aspect-auto mt-2 h-36 w-full", CHART_DARK)}
        >
          <AreaChart data={series.points}>
            <defs>
              <linearGradient id={`g-${series.sensorId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-v)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-v)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]}
              axisLine={false} tickMargin={8} minTickGap={40} tickFormatter={fmtTick} />
            <YAxis width={44} domain={["auto", "auto"]} />
            <ChartTooltip cursor={false} content={
              <ChartTooltipContent indicator="dot" className={TOOLTIP_DARK}
                labelFormatter={(_, p) => fmtFull(p?.[0]?.payload?.t)} />
            } />
            <Area dataKey="v" type="monotone" stroke="var(--color-v)" fill={`url(#g-${series.sensorId})`}
              fillOpacity={0.2} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ChartContainer>
      )}
    </section>
  );
}

interface Props {
  asset: MapAsset;
  siblings: MapAsset[];
  placeName: string;
  series: SensorSeries[] | null;
  loading: boolean;
  error: boolean;
  truncated: boolean;
  requests: string[];
  via?: "assetId" | "sensorId";
  onSelectAsset: (id: string) => void;
  onClose: () => void;
}

/** Nome da aba: o que o dashboard mostra; se houver repetidos, acrescenta o nome. */
function tabLabel(a: MapAsset, siblings: MapAsset[], placeName: string) {
  const base = dashboardsOf(a).join(" + ") || a.name;
  const dup = siblings.filter((s) => dashboardsOf(s).join("+") === dashboardsOf(a).join("+")).length > 1;
  return dup ? a.name.replace(`${placeName} - `, "") : base;
}

const NOTICE = "rounded-lg border p-2 text-xs backdrop-blur-sm";

/** Painel esquerdo: séries temporais (tensão, corrente, FP, nível, bateria...). */
export function SeriesCharts(p: Props) {
  const lines = (p.series ?? []).filter((s) => metricFor(s.sensorType).mode === "level");

  return (
    <div className="space-y-3 p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white drop-shadow-sm">
            {p.siblings.length > 1 ? p.placeName : p.asset.name}
          </h2>
          <p className="text-xs text-sky-100/90">
            Dashboards disponíveis:{" "}
            {dashboardsFromTypes(
              p.series?.length
                ? p.series.filter((s) => s.points.length > 0).map((s) => s.sensorType)
                : p.asset.sensors.map((s) => s.type)
            ).join(" · ") || "—"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`/api/assets/${p.asset.id}/export`}
            download
            title="Exportar leituras do último mês em CSV"
            className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-300 bg-slate-900 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            ⭳ CSV
          </a>
          <button onClick={p.onClose} aria-label="Fechar painel"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-900 text-2xl leading-none text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">×</button>
        </div>
      </header>

      {p.siblings.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {p.siblings.map((a) => (
            <button key={a.id} onClick={() => p.onSelectAsset(a.id)}
              className={cn("rounded-full border px-2.5 py-1 text-xs transition",
                a.id === p.asset.id
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-sky-100/25 bg-slate-950/25 text-sky-50 hover:bg-sky-100/15")}>
              {tabLabel(a, p.siblings, p.placeName)}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-sky-100/90">
        Últimas {QUERY.intervalMinutes / 60}h (intervalo {QUERY.intervalMinutes} min, limite {QUERY.limit} leituras)
      </p>

      {p.asset.provisional && (
        <p className={cn(NOTICE, "border-slate-200/80 bg-[#E7F1F9]/90 text-slate-700")}>
          📍 Posição provisória no mapa. Para fixar, adicione em{" "}
          <code>lib/assets/locations.ts</code>:
          <br />
          <code className="break-all text-[11px]">&quot;{p.asset.id}&quot;: {"{ lat: , lng:  }"}</code>
        </p>
      )}

      {p.error && (
        <p className={cn(NOTICE, "border-amber-200 bg-amber-50 text-amber-900")}>
          Não foi possível carregar os dados da API IoT.
        </p>
      )}
      {p.truncated && (
        <p className={cn(NOTICE, "border-blue-200 bg-blue-50 text-blue-900")}>
          A consulta é limitada a {QUERY.limit} leituras: mostrando as mais recentes.
        </p>
      )}

      {!p.loading && !p.error && p.series && p.series.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/55 bg-[#F0F7FC]/85 p-4 text-sm text-slate-700 shadow-sm backdrop-blur-[2px]">
          <p className="font-medium text-slate-900">A API não devolveu leituras para este local.</p>
          <p className="mt-1 text-xs">
            Nas últimas {QUERY.intervalMinutes / 60}h não há dados, ou o device ainda não está
            vinculado a este asset. Confira a resposta direto na API:
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            {p.requests.map((u) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noreferrer" className="break-all text-blue-600 underline">
                  {u.includes("assetId") ? "consulta por assetId" : "consulta por sensorId"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {p.loading
        ? [0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-slate-200/80" />)
        : lines.map((s) => <LineCard key={s.sensorId} series={s} />)}

      {p.via && !p.loading && p.series && p.series.length > 0 && (
        <p className="pt-1 text-center text-[11px] text-sky-100/75">via {p.via}</p>
      )}
    </div>
  );
}

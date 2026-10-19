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
    <section className="rounded-xl border border-gray-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-gray-900">
        {m.label} {m.unit && <span className="font-normal text-gray-500">({m.unit})</span>}
      </h3>
      {series.points.length === 0 ? (
        <p className="py-8 text-center text-xs italic text-gray-400">Sem leituras neste período</p>
      ) : (
        <ChartContainer config={config} className="aspect-auto mt-2 h-36 w-full">
          <AreaChart data={series.points}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]}
              axisLine={false} tickMargin={8} minTickGap={40} tickFormatter={fmtTick} />
            <YAxis width={44} domain={["auto", "auto"]} />
            <ChartTooltip cursor={false} content={
              <ChartTooltipContent indicator="dot"
                labelFormatter={(_, p) => fmtFull(p?.[0]?.payload?.t)} />
            } />
            <Area dataKey="v" type="monotone" stroke="var(--color-v)" fill="var(--color-v)"
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
  onSelectAsset: (id: string) => void;
  onClose: () => void;
}

/** Nome da aba: o que o dashboard mostra; se houver repetidos, acrescenta o nome. */
function tabLabel(a: MapAsset, siblings: MapAsset[], placeName: string) {
  const base = dashboardsOf(a).join(" + ") || a.name;
  const dup = siblings.filter((s) => dashboardsOf(s).join("+") === dashboardsOf(a).join("+")).length > 1;
  return dup ? a.name.replace(`${placeName} - `, "") : base;
}

/** Painel esquerdo: séries temporais (tensão, corrente, FP, nível, bateria...). */
export function SeriesCharts(p: Props) {
  const lines = (p.series ?? []).filter((s) => metricFor(s.sensorType).mode === "level");

  return (
    <div className="space-y-3 p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {p.siblings.length > 1 ? p.placeName : p.asset.name}
          </h2>
          <p className="text-xs text-gray-500">
            Dashboards disponíveis:{" "}
            {dashboardsFromTypes(
              p.series?.length
                ? p.series.filter((s) => s.points.length > 0).map((s) => s.sensorType)
                : p.asset.sensors.map((s) => s.type)
            ).join(" · ") || "—"}
          </p>
        </div>
        <button onClick={p.onClose} aria-label="Fechar painel"
          className="text-xl leading-none text-gray-400 hover:text-gray-600">×</button>
      </header>

      {p.siblings.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {p.siblings.map((a) => (
            <button key={a.id} onClick={() => p.onSelectAsset(a.id)}
              className={cn("rounded-full border px-2.5 py-1 text-xs",
                a.id === p.asset.id ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100")}>
              {tabLabel(a, p.siblings, p.placeName)}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Últimas {QUERY.intervalMinutes / 60}h (intervalo {QUERY.intervalMinutes} min, limite {QUERY.limit} leituras)
      </p>

      {p.asset.provisional && (
        <p className="rounded-lg bg-gray-100 p-2 text-xs text-gray-600">
          📍 Posição provisória no mapa. Para fixar, adicione em{" "}
          <code>lib/assets/locations.ts</code>:
          <br />
          <code className="break-all text-[11px]">&quot;{p.asset.id}&quot;: {"{ lat: , lng:  }"}</code>
        </p>
      )}

      {p.error && (
        <p className="rounded-lg bg-yellow-50 p-2 text-xs text-yellow-800">
          Não foi possível carregar os dados da API IoT.
        </p>
      )}
      {p.truncated && (
        <p className="rounded-lg bg-blue-50 p-2 text-xs text-blue-800">
          A consulta é limitada a {QUERY.limit} leituras: mostrando as mais recentes.
        </p>
      )}

      {p.loading
        ? [0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />)
        : lines.map((s) => <LineCard key={s.sensorId} series={s} />)}

    </div>
  );
}

// Cliente da API IoT (só roda no servidor: usado pela rota /api/assets/[assetId]/timeseries).
import { METRICS } from "@/lib/asset-metrics";
import { QUERY, type AssetTimeseries, type SensorSeries } from "@/lib/assets/types";

const BASE_URL =
  process.env.IOT_API_URL ??
  "https://iot.maua.br/api/timeseries/v0.4/imt/iot/sensors";

interface RawSeries {
  sensor_id?: string;
  sensor_type: string;
  /** [epoch em ns (string), valor] — a API devolve do mais novo para o mais antigo */
  series: [string, number | boolean][];
}

const metricOrder = (type: string) => {
  const i = Object.keys(METRICS).indexOf(type);
  return i === -1 ? 99 : i;
};

/** Equivale a preencher assetId + interval (300) + limit (1000) no Query Builder da API. */
export async function fetchAssetTimeseries(assetId: string): Promise<AssetTimeseries> {
  const url = new URL(BASE_URL);
  url.searchParams.set("assetId", assetId);
  url.searchParams.set("interval", String(QUERY.intervalMinutes));
  url.searchParams.set("limit", String(QUERY.limit));

  const res = await fetch(url, {
    next: { revalidate: 30 },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`API IoT respondeu ${res.status}`);
  const raw = (await res.json()) as RawSeries[];

  let total = 0;
  const series: SensorSeries[] = raw
    .map((r) => {
      const points = (r.series ?? [])
        .map(([ns, value]) => ({
          t: Math.floor(Number(ns) / 1e6),
          v: typeof value === "boolean" ? Number(value) : value,
        }))
        .sort((a, b) => a.t - b.t);
      total += points.length;
      return {
        sensorId: r.sensor_id ?? `${assetId}:${r.sensor_type}`,
        sensorType: r.sensor_type,
        points,
      };
    })
    .sort((a, b) => metricOrder(a.sensorType) - metricOrder(b.sensorType));

  return { assetId, fetchedAt: Date.now(), truncated: total >= QUERY.limit, series };
}

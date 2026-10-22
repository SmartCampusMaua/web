// Cliente da API IoT (só roda no servidor: usado pela rota /maps/data/[assetId]).
import { METRICS } from "@/lib/asset-metrics";
import { QUERY, type Asset, type AssetTimeseries, type SensorSeries } from "@/lib/assets/types";

// Variável PRÓPRIA de propósito: IOT_API_URL já é usada em outros arquivos do projeto
// (influx.ts, api.ts) com significados diferentes, e reaproveitá-la quebrava esta URL.
const BASE_URL =
  process.env.IOT_TIMESERIES_URL ??
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

function buildUrl(filter: Record<string, string>) {
  const url = new URL(BASE_URL);
  for (const [k, v] of Object.entries(filter)) url.searchParams.set(k, v);
  url.searchParams.set("interval", String(QUERY.intervalMinutes));
  url.searchParams.set("limit", String(QUERY.limit));
  return url;
}

// "Último mês" = 30 dias, em minutos (unidade que a API IoT usa para o interval).
const EXPORT_INTERVAL_MINUTES = 30 * 24 * 60;
// Sem limit explícito a API aplica o default dela (bem menor que 30 dias de leituras);
// 10000 garante que o intervalo de 30 dias não seja cortado antes da hora.
const EXPORT_LIMIT = 10_000;

/** CSV bruto do último mês de leituras de um asset, direto da API IoT. */
export async function fetchAssetExportCsv(asset: Asset): Promise<string> {
  const url = new URL(`${BASE_URL}/export`);
  url.searchParams.set("format", "csv");
  url.searchParams.set("assetId", asset.id);
  url.searchParams.set("interval", String(EXPORT_INTERVAL_MINUTES));
  url.searchParams.set("limit", String(EXPORT_LIMIT));

  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`API IoT (export) respondeu ${res.status}`);
  return res.text();
}

async function query(url: URL): Promise<RawSeries[]> {
  const res = await fetch(url, {
    next: { revalidate: 30 },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`API IoT respondeu ${res.status}`);
  return (await res.json()) as RawSeries[];
}

/**
 * Equivale a preencher assetId + interval (300) + limit (1000) no Query Builder da API.
 * Alguns devices ainda não têm asset_id gravado no banco: se a consulta por assetId
 * vier vazia ou falhar, tenta pela lista de sensor_ids da planilha.
 */
export async function fetchAssetTimeseries(asset: Asset): Promise<AssetTimeseries> {
  const requests: string[] = [];
  let via: AssetTimeseries["via"] = "assetId";
  let raw: RawSeries[] = [];

  const byAsset = buildUrl({ assetId: asset.id });
  requests.push(byAsset.toString());
  try {
    raw = await query(byAsset);
  } catch (err) {
    console.warn(`[timeseries] assetId falhou para ${asset.name}:`, err);
  }

  if (raw.length === 0 && asset.sensors.length > 0) {
    via = "sensorId";
    const bySensors = buildUrl({ sensorId: asset.sensors.map((s) => s.id).join(",") });
    requests.push(bySensors.toString());
    raw = await query(bySensors);
  }

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
        sensorId: r.sensor_id ?? `${asset.id}:${r.sensor_type}`,
        sensorType: r.sensor_type,
        points,
      };
    })
    .sort((a, b) => metricOrder(a.sensorType) - metricOrder(b.sensorType));

  return {
    assetId: asset.id,
    via,
    requests,
    fetchedAt: Date.now(),
    truncated: total >= QUERY.limit,
    series,
  };
}

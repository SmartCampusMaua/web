export interface AssetSensor {
  /** sensor_id (UUID) — é o que a API de timeseries filtra */
  id: string;
  /** voltage_u_ll_avg, current_i_avg, power_factor, energy_a_plus, water_level, pulse_count, battery_level */
  type: string;
}

export interface Asset {
  /** asset_id da planilha */
  id: string;
  name: string;
  deviceId: string;
  devEui?: string;
  rating?: string;
  sensors: AssetSensor[];
  /** outros nomes que a planilha dá ao mesmo asset */
  aliases?: string[];
}

export interface AssetLocation {
  lat: number;
  lng: number;
  /** nome do arquivo em public/icons/assets/ (opcional; sem ele usa o pin padrão) */
  icon?: string;
  color?: string;
}

export interface MapAsset extends Asset {
  location: AssetLocation;
  /** true = ainda não tem coordenada em locations.ts; está numa grade provisória */
  provisional: boolean;
}

/** Um ponto do mapa. Vários assets podem dividir as mesmas coordenadas. */
export interface AssetPlace {
  key: string;
  name: string;
  lat: number;
  lng: number;
  assets: MapAsset[];
}

/* ---------- Timeseries (contrato entre /api/assets/[id]/timeseries e o front) ---------- */

/** Parâmetros fixos da consulta à API IoT. */
export const QUERY = { intervalMinutes: 300, limit: 1000 } as const;

export interface SeriesPoint {
  /** epoch em milissegundos */
  t: number;
  v: number;
}

export interface SensorSeries {
  sensorId: string;
  sensorType: string;
  /** ordem cronológica crescente */
  points: SeriesPoint[];
}

export interface AssetTimeseries {
  assetId: string;
  fetchedAt: number;
  /** true quando bateu no limit: só as leituras mais recentes vieram */
  truncated: boolean;
  series: SensorSeries[];
}

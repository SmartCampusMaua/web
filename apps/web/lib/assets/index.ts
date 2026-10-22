import { ASSET_LOCATIONS } from "./locations";
import { ASSET_REGISTRY } from "./registry.generated";
import type { Asset, AssetLocation, AssetPlace, MapAsset } from "./types";

const ENERGY_SENSOR_TYPES = new Set([
  "voltage_u_ll_avg",
  "current_i_avg",
  "power_factor",
  "energy_a_plus",
]);
const WATER_SENSOR_TYPES = new Set(["water_level", "pulse_count"]);

export type AssetKind = "energy" | "water" | "generic";

/** Classifica um asset pelo tipo dos sensores que ele carrega. */
export function getAssetKind(asset: Asset): AssetKind {
  if (asset.sensors.some((s) => ENERGY_SENSOR_TYPES.has(s.type))) return "energy";
  if (asset.sensors.some((s) => WATER_SENSOR_TYPES.has(s.type))) return "water";
  return "generic";
}

/** Um local pode agrupar vários assets; usa o primeiro tipo reconhecido. */
export function getPlaceKind(assets: Asset[]): AssetKind {
  for (const asset of assets) {
    const kind = getAssetKind(asset);
    if (kind !== "generic") return kind;
  }
  return "generic";
}

/**
 * Enquanto um asset não tem coordenada em locations.ts, ele fica numa grade
 * provisória ao norte do campus, para já aparecer no mapa com os dados certos.
 */
const STAGING = { lat: -23.6446, lng: -46.5782, dLat: -0.0006, dLng: 0.0007, cols: 4 };

const stagingSpot = (i: number): AssetLocation => ({
  lat: STAGING.lat + Math.floor(i / STAGING.cols) * STAGING.dLat,
  lng: STAGING.lng + (i % STAGING.cols) * STAGING.dLng,
});

function toMapAssets(assets: Asset[]): MapAsset[] {
  let staged = 0;
  return assets.filter((a) => ASSET_LOCATIONS[a.id]).map((a) => {
    const location = ASSET_LOCATIONS[a.id];
    return location
      ? { ...a, location, provisional: false }
      : { ...a, location: stagingSpot(staged++), provisional: true };
  });
}

export const ASSETS: MapAsset[] = toMapAssets(ASSET_REGISTRY);

export const getAsset = (id: string) => ASSETS.find((a) => a.id === id);

const placeKey = (lat: number, lng: number) => `${lat.toFixed(6)},${lng.toFixed(6)}`;

/** "Central - Cisterna" + "Central - Consumo" → "Central" */
function placeName(assets: MapAsset[]) {
  if (assets.length === 1) return assets[0].name;
  const heads = new Set(assets.map((a) => a.name.split(" - ")[0]));
  return heads.size === 1 ? [...heads][0] : `${assets.length} pontos`;
}

/** Assets com a mesma coordenada viram um único marcador. */
export function groupByPlace(assets: MapAsset[]): AssetPlace[] {
  const map = new Map<string, AssetPlace>();
  for (const asset of assets) {
    const { lat, lng } = asset.location;
    const key = placeKey(lat, lng);
    const place = map.get(key);
    if (place) place.assets.push(asset);
    else map.set(key, { key, name: asset.name, lat, lng, assets: [asset] });
  }
  return [...map.values()].map((p) => ({ ...p, name: placeName(p.assets) }));
}

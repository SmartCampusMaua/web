#!/usr/bin/env node
// Gera apps/web/lib/assets/registry.generated.ts a partir da planilha de assets.
// Uso:  node scripts/csv-to-assets.mjs caminho/da/planilha.csv
// Pode rodar de novo sempre que a planilha mudar (coordenadas ficam em locations.ts).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Uso: node scripts/csv-to-assets.mjs <planilha.csv>");
  process.exit(1);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const rows = text.split(/\r?\n/).map((l) => l.split(";").map((c) => c.trim()));

let section = null; // "energy" | "water"
let current = null;
const byAsset = new Map();
const warnings = [];

for (const r of rows) {
  if (r[1] === "Energy") section = "energy";
  if (r[0] === "Agua") section = "water";
  if (!section) continue;

  const [, col1, name, deviceId, assetId, devEui, sensorType, sensorId] = r;

  if (UUID.test(deviceId) && UUID.test(assetId) && UUID.test(sensorId)) {
    // Linha que abre um asset
    let a = byAsset.get(assetId);
    if (!a) {
      a = {
        id: assetId,
        name,
        deviceId,
        devEui: devEui || undefined,
        rating: section === "energy" ? col1 || undefined : undefined,
        sensors: [],
        aliases: [],
      };
      byAsset.set(assetId, a);
    } else if (name && name !== a.name) {
      a.aliases.push(name);
      warnings.push(`asset ${assetId} repetido: "${a.name}" e "${name}"`);
    }
    current = a;
    if (!a.sensors.some((s) => s.id === sensorId))
      a.sensors.push({ type: sensorType, id: sensorId });
  } else if (current && !deviceId && UUID.test(sensorId) && sensorType) {
    // Linha extra de sensor do mesmo asset (tensão/corrente/fp/energia)
    if (!current.sensors.some((s) => s.id === sensorId))
      current.sensors.push({ type: sensorType, id: sensorId });
  } else if (deviceId && !UUID.test(assetId)) {
    current = null; // linha solta sem asset_id: ignora
    if (UUID.test(deviceId)) warnings.push(`device ${deviceId} sem asset_id (ignorado)`);
  }
}

const assets = [...byAsset.values()].map((a) => {
  if (!a.name) {
    const tail = (a.devEui ?? a.deviceId).slice(-4);
    a.name = `Medidor ${a.rating ?? ""} (${tail})`.replace("  ", " ");
    warnings.push(`asset ${a.id} sem nome na planilha → "${a.name}"`);
  }
  if (!a.aliases.length) delete a.aliases;
  return a;
});

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../apps/web/lib/assets/registry.generated.ts");
const body = `// ARQUIVO GERADO por scripts/csv-to-assets.mjs — não edite à mão.
// Para atualizar: node scripts/csv-to-assets.mjs <planilha.csv>
import type { Asset } from "./types";

export const ASSET_REGISTRY: Asset[] = ${JSON.stringify(assets, null, 2)};
`;
writeFileSync(out, body);

console.log(`${assets.length} assets`);
console.log(`→ ${out}`);
for (const w of warnings) console.warn("⚠", w);

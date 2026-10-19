import type { AssetLocation } from "./types";

/**
 * Onde cada asset fica no mapa (chave = asset_id da planilha).
 * Edite à mão: o script de importação NUNCA mexe neste arquivo.
 * Assets que não estão aqui aparecem na lista "Sem localização" do mapa.
 *
 * Para dar um ícone próprio a um asset: coloque o SVG em
 * apps/web/public/icons/assets/ e preencha `icon: "arquivo.svg"`.
 */
export const ASSET_LOCATIONS: Record<string, AssetLocation> = {
  // Restaurante - Bloco V
  "01a08185-4622-74e9-9517-54a53c4ccc3d": { lat: -23.64819564988993, lng: -46.57441253916657 },
  // Restaurante - Bloco N
  "01a08185-4622-74f1-8a17-b2376393bde5": { lat: -23.649511316153184, lng: -46.572751243805925 },
  // Restaurante - Ginásio
  "01a08185-4622-74f5-a1ab-ba1d6325341e": { lat: -23.64707650417544, lng: -46.57305993118999 },
  // Restaurante - Quiosque
  "01a08185-4622-74fd-b989-02d977a465ea": { lat: -23.648892753482794, lng: -46.5728712161721 },
  // Restaurante - Açai
  "01a08185-4622-7505-9b35-937548b9406b": { lat: -23.648092071563553, lng: -46.574687940662365 },
  // Central - Reserva Bombeiros
  "01a08185-4622-73a9-8d77-43b6c545d111": { lat: -23.64783508471281, lng: -46.57322304699091 },
  // Central - Consumo
  "01a08185-4622-73b1-a6ae-bc26c14e537a": { lat: -23.64783508471281, lng: -46.57322304699091 },
  // Central - Reserva Consumo
  "01a08185-4622-73b5-82ef-61113fef5700": { lat: -23.64783508471281, lng: -46.57322304699091 },
  // Central - Cisterna
  "01a08185-4622-7382-85b1-5ce4518a52d3": { lat: -23.64783508471281, lng: -46.57322304699091 },
  // Caixa Agua - H
  "01a08185-4622-7386-9a07-3fd7edbc6c64": { lat: -23.648500924327955, lng: -46.57451318944901 },
  // Reserva U
  "01a08185-4622-7395-bfa2-130543f2e14e": { lat: -23.646754009486493, lng: -46.573442988091635 },
  // Caixa Agua - Banco S
  "01a08185-4622-739d-a932-1b0dd0e8d35d": { lat: -23.649573637073875, lng: -46.57436639498939 },
};

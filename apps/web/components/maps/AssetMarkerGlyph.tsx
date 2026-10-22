"use client";

import { getPlaceKind } from "@/lib/assets";
import type { MapAsset } from "@/lib/assets/types";
import { BOLT_PATH, DROP_PATH, PIN_PATH } from "./asset-icons";

interface AssetMarkerGlyphProps {
  assets: MapAsset[];
  selected: boolean;
}

const PIN_COLOR = "#4f46e5";
const VIEWBOX_SIZE = 56;
const CENTER = VIEWBOX_SIZE / 2;

/**
 * Versão em SVG puro do AssetMarker, usada dentro do Marker3D.
 * O <gmp-marker-3d-interactive> só aceita <template>/PinElement como conteúdo
 * e a lib só auto-envolve filhos <img>/<svg> em <template> — um <div> HTML
 * (como o AssetMarker) é rejeitado em tempo de execução.
 */
export function AssetMarkerGlyph({ assets, selected }: AssetMarkerGlyphProps) {
  const main = assets[0];
  const provisional = assets.every((a) => a.provisional);
  const color = provisional ? "#9ca3af" : (main.location.color ?? PIN_COLOR);
  const icon = main.location.icon;
  const kind = getPlaceKind(assets);
  const glyphPath =
    kind === "energy" ? BOLT_PATH : kind === "water" ? DROP_PATH : PIN_PATH;

  const baseRadius = provisional ? 14 : 18;
  const radius = selected ? baseRadius * 1.25 : baseRadius;
  const iconSize = (provisional ? 16 : 20) * (selected ? 1.25 : 1);

  return (
    <svg
      width={VIEWBOX_SIZE}
      height={VIEWBOX_SIZE}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {selected && (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={radius + 5}
          fill="none"
          stroke="white"
          strokeOpacity={0.85}
          strokeWidth={4}
        />
      )}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={radius}
        fill="white"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={provisional ? "4 3" : undefined}
      />
      {icon ? (
        <image
          href={`/icons/assets/${icon}`}
          x={CENTER - iconSize / 2}
          y={CENTER - iconSize / 2}
          width={iconSize}
          height={iconSize}
        />
      ) : (
        <path
          d={glyphPath}
          fill={color}
          transform={`translate(${CENTER - iconSize / 2}, ${CENTER - iconSize / 2}) scale(${iconSize / 24})`}
        />
      )}
      {assets.length > 1 && (
        <>
          <circle cx={VIEWBOX_SIZE - 10} cy={10} r={9} fill="#111827" />
          <text
            x={VIEWBOX_SIZE - 10}
            y={13.5}
            textAnchor="middle"
            fontSize="11"
            fontWeight={600}
            fill="white"
          >
            {assets.length}
          </text>
        </>
      )}
    </svg>
  );
}

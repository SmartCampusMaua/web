"use client";

import { getPlaceKind } from "@/lib/assets";
import type { MapAsset } from "@/lib/assets/types";
import { cn } from "@/lib/utils";
import { BOLT_PATH, DROP_PATH, PIN_PATH } from "./asset-icons";

interface AssetMarkerProps {
  assets: MapAsset[];
  selected: boolean;
}

const PIN_COLOR = "#4f46e5";

/** Marcador genérico de local. Borda tracejada = posição ainda provisória. */
export function AssetMarker({ assets, selected }: AssetMarkerProps) {
  const main = assets[0];
  const provisional = assets.every((a) => a.provisional);
  const color = provisional ? "#9ca3af" : (main.location.color ?? PIN_COLOR);
  const icon = main.location.icon;
  const kind = getPlaceKind(assets);
  const glyphPath =
    kind === "energy" ? BOLT_PATH : kind === "water" ? DROP_PATH : PIN_PATH;

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-[3px] bg-white shadow-lg transition-transform",
          provisional ? "size-7 border-dashed" : "size-9",
          selected && "scale-125 ring-4 ring-cyan-300/70 shadow-[0_0_22px_rgba(34,211,238,0.9)]"
        )}
        style={{ borderColor: color }}
      >
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/icons/assets/${icon}`} alt={main.name} className="size-5" />
        ) : (
          <svg viewBox="0 0 24 24" className={provisional ? "size-4" : "size-5"} fill={color} aria-hidden>
            <path d={glyphPath} />
          </svg>
        )}
      </div>
      {assets.length > 1 && (
        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
          {assets.length}
        </span>
      )}
    </div>
  );
}

"use client";

import type { MapAsset } from "@/lib/assets/types";
import { cn } from "@/lib/utils";

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

  return (
    <div className="relative">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-full border-[3px] bg-white shadow-lg transition-transform",
          provisional && "border-dashed",
          selected && "scale-125 ring-4 ring-white/80"
        )}
        style={{ borderColor: color }}
      >
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/icons/assets/${icon}`} alt={main.name} className="size-5" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill={color} aria-hidden>
            <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
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

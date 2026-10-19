"use client";

import type { PlacedAsset } from "@/lib/assets/types";
import { KIND_EMOJI } from "@/lib/asset-metrics";
import { cn } from "@/lib/utils";

interface Props {
  assets: PlacedAsset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Assets que ainda não têm coordenadas em lib/assets/locations.ts. */
export function UnplacedList({ assets, selectedId, onSelect }: Props) {
  if (assets.length === 0) return null;
  return (
    <details className="absolute bottom-10 left-3 z-10 w-64 rounded-xl bg-white/95 p-3 text-sm shadow-lg">
      <summary className="cursor-pointer font-semibold text-gray-700">
        Sem localização ({assets.length})
      </summary>
      <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
        {assets.map((a) => (
          <li key={a.id}>
            <button
              onClick={() => onSelect(a.id)}
              className={cn(
                "w-full rounded-md px-2 py-1 text-left hover:bg-gray-100",
                a.id === selectedId && "bg-gray-100 font-medium"
              )}
            >
              {KIND_EMOJI[a.kind]} {a.name}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ASSETS, groupByPlace } from "@/lib/assets";
import { useAssetTimeseries } from "@/lib/hooks/use-asset-timeseries";
import { SeriesCharts } from "@/components/dashboard/SeriesCharts";
import { SeriesKpis } from "@/components/dashboard/SeriesKpis";
import { cn } from "@/lib/utils";
import { AssetMap } from "./AssetMap";

export function MapDashboard({ apiKey }: { apiKey: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const places = useMemo(() => groupByPlace(ASSETS), []);
  const asset = ASSETS.find((a) => a.id === selectedId) ?? null;
  const place = places.find((p) => p.assets.some((a) => a.id === selectedId)) ?? null;
  const { data, loading, error } = useAssetTimeseries(selectedId);

  const aside = "smartcampus-glass-scrollbar min-h-0 min-w-0 overflow-y-auto bg-[#102B46]/75 text-white backdrop-blur-[3px] border-sky-100/20 shadow-[0_8px_28px_rgba(2,12,27,0.22)]";
  const open = asset !== null;

  return (
    <div
      className={cn(
        "relative grid h-full w-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto_auto] overflow-hidden",
        "lg:block"
      )}
    >
      <aside
        aria-hidden={!open}
        className={cn(
          aside,
          "order-2 border-t lg:absolute lg:inset-y-0 lg:left-0 lg:z-10 lg:order-none lg:w-[380px] lg:border lg:border-l-0 lg:border-sky-100/20 lg:rounded-r-2xl",
          "overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none",
          open
            ? "max-h-[40vh] translate-x-0 opacity-100 overflow-y-auto pointer-events-auto lg:max-h-none"
            : "max-h-0 -translate-x-4 opacity-0 pointer-events-none lg:max-h-none lg:-translate-x-full"
        )}
      >
        {asset && (
          <SeriesCharts
            asset={asset}
            siblings={place?.assets ?? [asset]}
            placeName={place?.name ?? asset.name}
            series={data?.series ?? null}
            loading={loading}
            error={error}
            truncated={data?.truncated ?? false}
            requests={data?.requests ?? []}
            via={data?.via}
            onSelectAsset={setSelectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </aside>

      <div className="relative order-1 min-h-0 min-w-0 lg:absolute lg:inset-0 lg:z-0">
        <AssetMap
          apiKey={apiKey}
          places={places}
          selectedAssetId={selectedId}
          onSelectAsset={setSelectedId}
        />
      </div>

      <aside
        aria-hidden={!open}
        className={cn(
          aside,
          "order-3 border-t lg:absolute lg:inset-y-0 lg:right-0 lg:z-10 lg:order-none lg:w-[340px] lg:border lg:border-r-0 lg:border-sky-100/20 lg:rounded-l-2xl",
          "overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none",
          open
            ? "max-h-[40vh] translate-x-0 opacity-100 overflow-y-auto pointer-events-auto lg:max-h-none"
            : "max-h-0 translate-x-4 opacity-0 pointer-events-none lg:max-h-none lg:translate-x-full"
        )}
      >
        {asset && <SeriesKpis series={data?.series ?? null} loading={loading} error={error} />}
      </aside>

      <style jsx global>{`
        .smartcampus-glass-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(71, 85, 105, 0.45) transparent;
        }
        .smartcampus-glass-scrollbar::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .smartcampus-glass-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .smartcampus-glass-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.38);
          border: 2px solid transparent;
          border-radius: 999px;
          background-clip: padding-box;
        }
        .smartcampus-glass-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(51, 65, 85, 0.68);
          border: 1px solid transparent;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}

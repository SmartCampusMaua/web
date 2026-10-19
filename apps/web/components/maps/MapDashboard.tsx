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

  const aside = "min-h-0 min-w-0 overflow-y-auto bg-gray-50";
  const open = asset !== null;

  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto_auto]",
        "lg:grid-rows-1 lg:transition-[grid-template-columns] lg:duration-300",
        open ? "lg:grid-cols-[380px_1fr_340px]" : "lg:grid-cols-[0px_1fr_0px]"
      )}
    >
      <aside className={cn(aside, "order-2 max-h-[40vh] border-t lg:order-1 lg:max-h-none lg:border-r lg:border-t-0", !open && "hidden lg:block")}>
        {asset && (
          <SeriesCharts
            asset={asset}
            siblings={place?.assets ?? [asset]}
            placeName={place?.name ?? asset.name}
            series={data?.series ?? null}
            loading={loading}
            error={error}
            truncated={data?.truncated ?? false}
            onSelectAsset={setSelectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </aside>

      <div className="relative order-1 min-h-0 min-w-0 lg:order-2">
        <AssetMap
          apiKey={apiKey}
          places={places}
          selectedAssetId={selectedId}
          onSelectAsset={setSelectedId}
        />
      </div>

      <aside className={cn(aside, "order-3 max-h-[40vh] border-t lg:max-h-none lg:border-l lg:border-t-0", !open && "hidden lg:block")}>
        {asset && <SeriesKpis series={data?.series ?? null} loading={loading} />}
      </aside>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ASSETS, groupByPlace } from "@/lib/assets";
import { useAssetTimeseries } from "@/lib/hooks/use-asset-timeseries";
import { GlassPanel } from "@/components/dashboard/glass";
import { SeriesCharts } from "@/components/dashboard/SeriesCharts";
import { SeriesKpis } from "@/components/dashboard/SeriesKpis";
import { AssetMap } from "./AssetMap";

export function MapDashboard({ apiKey }: { apiKey: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const places = useMemo(() => groupByPlace(ASSETS), []);
  const asset = ASSETS.find((a) => a.id === selectedId) ?? null;
  const place = places.find((p) => p.assets.some((a) => a.id === selectedId)) ?? null;
  const { data, loading, error } = useAssetTimeseries(selectedId);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* O mapa ocupa tudo; os painéis de vidro flutuam por cima, nas laterais */}
      <div className="absolute inset-0">
        <AssetMap
          apiKey={apiKey}
          places={places}
          selectedAssetId={selectedId}
          onSelectAsset={setSelectedId}
        />
      </div>

      {asset && (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 top-1/2 flex flex-col gap-2 overflow-y-auto max-lg:pointer-events-auto lg:inset-3 lg:flex-row lg:justify-between lg:overflow-visible">
          <GlassPanel side="left">
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
          </GlassPanel>

          <GlassPanel side="right">
            <SeriesKpis series={data?.series ?? null} loading={loading} error={error} />
          </GlassPanel>
        </div>
      )}
    </div>
  );
}

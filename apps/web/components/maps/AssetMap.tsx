"use client";

import {
  AdvancedMarker,
  APIProvider,
  Map,
  Map3D,
  Marker3D,
  useMap3D,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import type { AssetPlace } from "@/lib/assets/types";
import { cn } from "@/lib/utils";
import { AssetMarker } from "./AssetMarker";
import { AssetMarkerGlyph } from "./AssetMarkerGlyph";

interface AssetMapProps {
  apiKey: string;
  places: AssetPlace[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string | null) => void;
}

type ViewMode = "2d" | "3d";

interface View3D {
  lat: number;
  lng: number;
  altitude: number;
  range: number;
  heading: number;
  tilt: number;
}

interface View2D {
  lat: number;
  lng: number;
  zoom: number;
}

const CAMPUS_CENTER = { lat: -23.6478, lng: -46.5754 };
const MIN_TILT = 0;
const MAX_TILT = 85;

const DEFAULT_VIEW_3D: View3D = {
  lat: -23.648073,
  lng: -46.574574,
  altitude: 751.0,
  range: 400.8,
  heading: 100.1,
  tilt: 56.7,
};
const DEFAULT_VIEW_2D: View2D = { ...CAMPUS_CENTER, zoom: 16 };

// A posição padrão é por navegador (localStorage), não global para todos os usuários
const VIEW_STORAGE_KEY = "smartcampus:mapDefaultView";

function loadStoredView<T>(mode: ViewMode, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.[mode] ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStoredView(mode: ViewMode, view: View3D | View2D) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[mode] = view;
    window.localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // modo privado / quota excedida: segue sem persistir
  }
}

// Mantém o ângulo de inclinação do Map3D sincronizado com o slider de tilt
function TiltSync3D({ tilt }: { tilt: number }) {
  const map3d = useMap3D();
  useEffect(() => {
    if (map3d) map3d.tilt = tilt;
  }, [map3d, tilt]);
  return null;
}

function ViewControls({
  mode,
  onModeChange,
  tilt,
  onTiltChange,
  onSaveView,
  saved,
}: {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  tilt: number;
  onTiltChange: (tilt: number) => void;
  onSaveView: () => void;
  saved: boolean;
}) {
  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSaveView}
          title="Usar a posição/ângulo atual do mapa como padrão inicial"
          className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-md backdrop-blur transition-colors hover:bg-gray-100"
        >
          {saved ? "✓ Padrão salvo" : "Definir como padrão"}
        </button>

        <div className="flex overflow-hidden rounded-full bg-white/90 shadow-md backdrop-blur">
          {(["2d", "3d"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors",
                mode === m
                  ? "bg-[#4f46e5] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {mode === "3d" && (
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-md backdrop-blur">
          <span className="text-xs font-medium text-gray-500">Tilt</span>
          <input
            type="range"
            min={MIN_TILT}
            max={MAX_TILT}
            step={5}
            value={tilt}
            onChange={(e) => onTiltChange(Number(e.target.value))}
            className="h-1 w-24 accent-[#4f46e5]"
          />
          <span className="w-8 text-right text-xs tabular-nums text-gray-500">
            {tilt}°
          </span>
        </div>
      )}
    </div>
  );
}

export function AssetMap({
  apiKey,
  places,
  selectedAssetId,
  onSelectAsset,
}: AssetMapProps) {
  const [mode, setMode] = useState<ViewMode>("3d");
  const [initialView3D] = useState(() => loadStoredView("3d", DEFAULT_VIEW_3D));
  const [initialView2D] = useState(() => loadStoredView("2d", DEFAULT_VIEW_2D));
  const [tilt, setTilt] = useState(initialView3D.tilt);
  const [saved, setSaved] = useState(false);
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guarda a câmera mais recente de cada modo sem forçar re-render a cada frame
  const liveView3D = useRef<View3D>(initialView3D);
  const liveView2D = useRef<View2D>(initialView2D);

  useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  // Esc fecha os painéis laterais em qualquer modo (2D ou 3D)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onSelectAsset(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectAsset]);

  const handleSaveView = () => {
    saveStoredView(mode, mode === "3d" ? liveView3D.current : liveView2D.current);
    setSaved(true);
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setSaved(false), 1800);
  };

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative h-full w-full">
        <ViewControls
          mode={mode}
          onModeChange={setMode}
          tilt={tilt}
          onTiltChange={setTilt}
          onSaveView={handleSaveView}
          saved={saved}
        />

        {mode === "3d" ? (
          <Map3D
            mode="SATELLITE"
            defaultCenter={{
              lat: initialView3D.lat,
              lng: initialView3D.lng,
              altitude: initialView3D.altitude,
            }}
            defaultRange={initialView3D.range}
            defaultTilt={tilt}
            defaultHeading={initialView3D.heading}
            className="h-full w-full"
            onClick={() => onSelectAsset(null)}
            onCameraChanged={(e) => {
              liveView3D.current = {
                lat: e.detail.center.lat,
                lng: e.detail.center.lng,
                altitude: e.detail.center.altitude,
                range: e.detail.range,
                heading: e.detail.heading,
                tilt: e.detail.tilt,
              };
            }}
          >
            {places.map((place) => {
              const selected = place.assets.some(
                (a) => a.id === selectedAssetId
              );
              return (
                <Marker3D
                  key={place.key}
                  position={{ lat: place.lat, lng: place.lng, altitude: 0 }}
                  onClick={(e) => {
                    // evita que o clique no marcador borbulhe até o onClick
                    // do Map3D (que fecharia o painel imediatamente)
                    e.stopPropagation();
                    if (!selected) onSelectAsset(place.assets[0].id);
                  }}
                >
                  <AssetMarkerGlyph assets={place.assets} selected={selected} />
                </Marker3D>
              );
            })}
            <TiltSync3D tilt={tilt} />
          </Map3D>
        ) : (
          <Map
            mapTypeId="satellite"
            // AdvancedMarker exige mapId. O aviso do Google sobre "satellite + mapId" é inofensivo.
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? "DEMO_MAP_ID"}
            defaultCenter={{ lat: initialView2D.lat, lng: initialView2D.lng }}
            defaultZoom={initialView2D.zoom}
            gestureHandling="greedy"
            className="h-full w-full"
            onClick={() => onSelectAsset(null)}
            onCameraChanged={(e) => {
              liveView2D.current = {
                lat: e.detail.center.lat,
                lng: e.detail.center.lng,
                zoom: e.detail.zoom,
              };
            }}
          >
            {places.map((place) => {
              const selected = place.assets.some(
                (a) => a.id === selectedAssetId
              );
              return (
                <AdvancedMarker
                  key={place.key}
                  position={{ lat: place.lat, lng: place.lng }}
                  title={place.name}
                  zIndex={selected ? 10 : 1}
                  onClick={() => !selected && onSelectAsset(place.assets[0].id)}
                >
                  <AssetMarker assets={place.assets} selected={selected} />
                </AdvancedMarker>
              );
            })}
          </Map>
        )}
      </div>
    </APIProvider>
  );
}

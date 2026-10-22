import { Home } from "lucide-react";
import Link from "next/link";
import { MapDashboard } from "@/components/maps/MapDashboard";
import { ASSETS } from "@/lib/assets";

const provisional = ASSETS.filter((a) => a.provisional).length;
const sensorCount = ASSETS.reduce((sum, a) => sum + a.sensors.length, 0);

export default function MapsPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <>
      <header className="relative z-20 flex shrink-0  items-center justify-between gap-3 border-b border-sky-100/20 bg-[#0B2036]/95 px-4 py-3 text-white shadow-[0_8px_28px_rgba(2,12,27,0.22)] backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Home"
            title="Home"
            className="text-sky-100/80 transition hover:text-white"
          >
            <Home className="size-5" />
          </Link>
          <span className="text-sky-100/25">|</span>
          <h1 className="text-lg font-bold tracking-tight text-white drop-shadow-sm">
            SmartCampusMauá Sensors Map
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-sky-100/80">
          <span>📍 {ASSETS.length} pontos de medição</span>
          {provisional > 0 && (
            <span className="text-sky-100/50">
              ({provisional} em posição provisória)
            </span>
          )}
          <span className="text-sky-100/50">
            · {sensorCount} sensores monitorados
          </span>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {!apiKey ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center p-8 bg-white rounded-xl shadow max-w-md">
              <p className="text-2xl mb-3">🗺️</p>
              <h2 className="text-xl font-semibold mb-2">
                Google Maps API Key Required
              </h2>
              <p className="text-gray-600 text-sm">
                Defina{" "}
                <code className="bg-gray-100 px-1 rounded">
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                </code>{" "}
                no <code className="bg-gray-100 px-1 rounded">.env</code> para
                exibir o mapa.
              </p>
            </div>
          </div>
        ) : (
          <MapDashboard apiKey={apiKey} />
        )}
      </div>
    </>
  );
}

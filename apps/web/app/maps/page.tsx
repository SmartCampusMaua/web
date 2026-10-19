import Link from "next/link";
import { MapDashboard } from "@/components/maps/MapDashboard";
import { ASSETS } from "@/lib/assets";

const provisional = ASSETS.filter((a) => a.provisional).length;

export default function MapsPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            ← Home
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold text-gray-900">SmartCampus Sensor Map</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>📍 {ASSETS.length} pontos de medição</span>
          {provisional > 0 && <span className="text-gray-400">({provisional} em posição provisória)</span>}
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {!apiKey ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center p-8 bg-white rounded-xl shadow max-w-md">
              <p className="text-2xl mb-3">🗺️</p>
              <h2 className="text-xl font-semibold mb-2">Google Maps API Key Required</h2>
              <p className="text-gray-600 text-sm">
                Defina <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> no{" "}
                <code className="bg-gray-100 px-1 rounded">.env</code> para exibir o mapa.
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

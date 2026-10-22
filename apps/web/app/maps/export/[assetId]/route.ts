import { NextResponse } from "next/server";
import { getAsset } from "@/lib/assets";
import { fetchAssetExportCsv } from "@/lib/iot-api";

const DIACRITICS = /[\u0300-\u036f]/g;

// NÃO pode começar com /api: em produção, iot.maua.br/api/* é roteado para a
// API IoT (outro serviço) — ver lib/assets/types.ts (timeseriesPath).
// Proxy fino, igual ao de /maps/data: só aceita asset_ids do cadastro.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const asset = getAsset(assetId);
  if (!asset) {
    return NextResponse.json({ error: "Asset desconhecido" }, { status: 404 });
  }

  try {
    const csv = await fetchAssetExportCsv(asset);
    const slug = asset.name
      .normalize("NFD")
      .replace(DIACRITICS, "")
      .replace(/[^a-zA-Z0-9]+/g, "-");
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-${date}.csv"`,
      },
    });
  } catch (err) {
    console.error(`[export] ${asset.name}:`, err);
    return NextResponse.json({ error: "Falha ao exportar CSV" }, { status: 502 });
  }
}

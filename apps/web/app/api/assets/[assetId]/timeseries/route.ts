import { NextResponse } from "next/server";
import { getAsset } from "@/lib/assets";
import { fetchAssetTimeseries } from "@/lib/iot-api";

// Proxy fino: o navegador fala com o Next, o Next fala com iot.maua.br.
// Só aceita asset_ids do cadastro, então não vira um proxy aberto.
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
    return NextResponse.json(await fetchAssetTimeseries(asset.id));
  } catch (err) {
    console.error(`[timeseries] ${asset.name}:`, err);
    return NextResponse.json({ error: "Falha ao consultar a API IoT" }, { status: 502 });
  }
}

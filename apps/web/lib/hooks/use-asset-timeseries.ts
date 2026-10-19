//"use client";

import { useEffect, useState } from "react";
import type { AssetTimeseries } from "@/lib/assets/types";

interface State {
  data: AssetTimeseries | null;
  loading: boolean;
  error: boolean;
}

/** Busca (e atualiza a cada minuto) todas as séries do asset selecionado. */
export function useAssetTimeseries(assetId: string | null, refreshMs = 60_000) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: false });

  useEffect(() => {
    if (!assetId) return;
    const controller = new AbortController();

    async function load(initial: boolean) {
      if (initial) setState({ data: null, loading: true, error: false });
      try {
        // Mudança aqui: Substitua o domínio por '/api-maua'
        const res = await fetch(`/api-iot/timeseries/v0.4/imt/iot/sensors?assetId=${assetId}&interval=300&limit=1000`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as AssetTimeseries;
        if (!controller.signal.aborted) setState({ data, loading: false, error: false });
      } catch {
        if (controller.signal.aborted) return;
        setState((s) => ({ data: s.data, loading: false, error: s.data === null }));
      }
    }

    load(true);
    const timer = setInterval(() => load(false), refreshMs);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [assetId, refreshMs]);

  return state;
}

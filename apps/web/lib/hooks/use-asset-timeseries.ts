"use client";

import { useEffect, useState } from "react";
import { timeseriesPath, type AssetTimeseries } from "@/lib/assets/types";

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
    const id = assetId;
    const controller = new AbortController();

    async function load(initial: boolean) {
      if (initial) setState({ data: null, loading: true, error: false });
      try {
        // Sempre pela rota do Next (app/maps/data/...): ela normaliza a resposta crua da API IoT.
        const res = await fetch(timeseriesPath(id), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as AssetTimeseries;
        // Se o formato não for o esperado (ex.: resposta crua da API), vira erro visível
        // em vez de painéis em branco.
        if (!Array.isArray(data?.series)) throw new Error("formato inesperado");
        if (!controller.signal.aborted) setState({ data, loading: false, error: false });
      } catch {
        if (controller.signal.aborted) return;
        // Em um refresh que falha, mantém o que já estava na tela.
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

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Painel lateral "vidro": translúcido, levemente desfocado, tema azul-marinho do SmartCampus. */
export function GlassPanel({
  side,
  children,
}: {
  side: "left" | "right";
  children: ReactNode;
}) {
  return (
    <aside
      className={cn(
        "pointer-events-auto relative min-h-0 overflow-y-auto rounded-2xl border border-sky-100/20 text-white",
        "bg-[#102B46]/55 backdrop-blur-[1.5px]",
        "shadow-[0_8px_28px_rgba(2,12,27,0.22)]",
        "[scrollbar-color:rgba(148,163,184,0.35)_transparent] [scrollbar-width:thin]",
        // animação de entrada (Tailwind v4 `starting:`); sem suporte do navegador, só aparece
        "transition-all duration-500 ease-out starting:opacity-0",
        "lg:max-h-full lg:self-start",
        side === "left"
          ? "lg:w-[380px] starting:-translate-x-8"
          : "lg:w-[340px] starting:translate-x-8"
      )}
    >
      <div className="pointer-events-none sticky top-0 z-10 h-px bg-gradient-to-r from-transparent via-sky-100/40 to-transparent" />
      {children}
    </aside>
  );
}

/** Cartão interno de cada gráfico/indicador: vidro claro sobre o painel escuro. */
export const GLASS_CARD =
  "rounded-xl border border-white/65 bg-[#F0F7FC]/90 p-3 shadow-[0_4px_16px_rgba(2,12,27,0.08)] backdrop-blur-[2px]";

// Os cartões voltaram a ser claros: gráficos usam as cores padrão do shadcn (texto escuro), sem overrides.
export const CHART_DARK = "";
export const TOOLTIP_DARK = "";

export const GRID_STROKE = "#e2e8f0";

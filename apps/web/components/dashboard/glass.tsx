import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Painel lateral "vidro": translúcido, desfocado, com brilho ciano. */
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
        "pointer-events-auto relative min-h-0 overflow-y-auto rounded-2xl border border-cyan-300/20 text-slate-100",
        "bg-slate-950/45 backdrop-blur-xl",
        "shadow-[0_0_40px_-12px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]",
        "[scrollbar-color:rgba(148,163,184,0.35)_transparent] [scrollbar-width:thin]",
        // animação de entrada (Tailwind v4 `starting:`); sem suporte do navegador, só aparece
        "transition-all duration-500 ease-out starting:opacity-0",
        "lg:max-h-full lg:self-start",
        side === "left"
          ? "lg:w-[380px] starting:-translate-x-8"
          : "lg:w-[340px] starting:translate-x-8"
      )}
    >
      <div className="pointer-events-none sticky top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      {children}
    </aside>
  );
}

/** Cartão interno de cada gráfico/indicador. */
export const GLASS_CARD =
  "rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

/** Ajustes de cor dos eixos/tooltip do shadcn para fundo escuro (independe do tema claro/escuro). */
export const CHART_DARK =
  "[&_.recharts-cartesian-axis-tick_text]:fill-slate-300/70";
export const TOOLTIP_DARK =
  "border-cyan-300/20 bg-slate-950/90 text-slate-100 backdrop-blur-md [&_.text-foreground]:text-slate-100 [&_.text-muted-foreground]:text-slate-400";

export const GRID_STROKE = "rgba(255,255,255,0.08)";

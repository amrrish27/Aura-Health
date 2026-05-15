import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  probability: number;
  window: string;
  reason: string;
};

export function PredictionCard({ title, probability, window, reason }: Props) {
  const animated = useAnimatedNumber(probability, 900);
  const color = animated > 65 ? "var(--danger)" : animated > 40 ? "var(--coral)" : "var(--success)";

  // Flash highlight when probability changes
  const prevRef = useRef(probability);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prevRef.current !== probability) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 700);
      prevRef.current = probability;
      return () => clearTimeout(t);
    }
  }, [probability]);

  return (
    <div
      className={cn(
        "float-in hover-lift relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-500",
      )}
      style={{ borderColor: flash ? color : undefined }}
    >
      {/* Flash overlay on update */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: flash ? 0.18 : 0,
          background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)`,
        }}
      />
      <div className="relative flex items-start gap-3">
        <div
          className="mt-0.5 grid h-9 w-9 place-items-center rounded-full shrink-0 transition-all duration-500"
          style={{
            background: `color-mix(in oklab, ${color} 18%, transparent)`,
            color,
            transform: flash ? "scale(1.1)" : "scale(1)",
          }}
        >
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-medium text-foreground">{title}</h4>
            <span
              className="font-display text-2xl tabular-nums transition-colors duration-500"
              style={{ color }}
              aria-live="polite"
            >
              {Math.round(animated)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">in {window}</p>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{reason}</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${animated}%`,
                background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 60%, white))`,
                transition: "width 0.9s cubic-bezier(0.22,1,0.36,1), background 0.5s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

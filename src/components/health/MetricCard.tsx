import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  delta: string;
  trend: "up" | "down" | "flat";
  good: "up" | "down";
  series: { v: number }[];
};

export function MetricCard({ icon: Icon, label, value, unit, delta, trend, good, series }: Props) {
  const isGood = trend === "flat" || trend === good;
  const color = isGood ? "var(--success)" : "var(--coral)";

  return (
    <div className="float-in rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] border border-border/60">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">{label}</span>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}
        >
          {delta}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-4xl text-foreground tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="h-12 -mx-1 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Line
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Moon,
  Footprints,
  HeartPulse,
  Waves,
  ArrowRight,
  Activity,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateWeek, computeRisk } from "@/lib/health-data";
import { RiskGauge } from "@/components/health/RiskGauge";
import { MetricCard } from "@/components/health/MetricCard";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [seed, setSeed] = useState(1);
  const week = useMemo(() => generateWeek(seed), [seed]);
  const risk = useMemo(() => computeRisk(week), [week]);
  const last = week[week.length - 1];
  const greeting =
    (user?.user_metadata?.full_name as string)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Bento header */}
      <div className="grid gap-4 lg:grid-cols-12 stagger">
        <div className="lg:col-span-7 rounded-3xl border border-border/60 bg-gradient-to-br from-card to-accent/30 p-7 shadow-[var(--shadow-card)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Pre-symptomatic intelligence
          </div>
          <h2 className="font-display text-3xl md:text-4xl mt-3 leading-tight">
            Hi {greeting} — your body is{" "}
            <em className="not-italic text-primary">{risk.band.toLowerCase()}</em>{" "}
            risk today.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            We analyzed 7 days of biosignals from your wearable. Composite risk
            index updates continuously.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="btn-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            >
              Re-run prediction <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/predictions"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-muted"
            >
              See predictions
            </Link>
            <Link
              to="/prevention"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-muted"
            >
              Prevention plan
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Risk Index</p>
              <p className="mt-1 text-sm text-foreground/70">7-day composite</p>
            </div>
          </div>
          <div className="mt-2 flex justify-center">
            <RiskGauge score={risk.score} band={risk.band} />
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <MetricCard
          icon={Moon}
          label="Sleep"
          value={last.sleepHours.toString()}
          unit="h"
          delta={`${(last.sleepHours - week[0].sleepHours).toFixed(1)}h`}
          trend={last.sleepHours < week[0].sleepHours ? "down" : "up"}
          good="up"
          series={week.map((d) => ({ v: d.sleepHours }))}
        />
        <MetricCard
          icon={Footprints}
          label="Activity"
          value={last.steps.toLocaleString()}
          unit="steps"
          delta={`${Math.round(((last.steps - week[0].steps) / week[0].steps) * 100)}%`}
          trend={last.steps < week[0].steps ? "down" : "up"}
          good="up"
          series={week.map((d) => ({ v: d.steps }))}
        />
        <MetricCard
          icon={HeartPulse}
          label="Resting HR"
          value={last.restingHr.toString()}
          unit="bpm"
          delta={`+${last.restingHr - week[0].restingHr} bpm`}
          trend={last.restingHr > week[0].restingHr ? "up" : "down"}
          good="down"
          series={week.map((d) => ({ v: d.restingHr }))}
        />
        <MetricCard
          icon={Waves}
          label="HRV"
          value={last.hrv.toString()}
          unit="ms"
          delta={`${last.hrv - week[0].hrv} ms`}
          trend={last.hrv < week[0].hrv ? "down" : "up"}
          good="up"
          series={week.map((d) => ({ v: d.hrv }))}
        />
      </div>

      {/* Trend + drivers */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Recovery vs strain</h3>
              <p className="text-xs text-muted-foreground">7-day composite trend</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> live model
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={week.map((d) => ({
                day: d.day,
                recovery: Math.round((d.hrv + d.sleepQuality + d.mood * 18) / 3),
                strain: Math.round((d.restingHr - 50) * 2.5 + d.fatigue * 10),
              }))}>
                <defs>
                  <linearGradient id="rec" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="str" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="recovery" stroke="var(--primary)" strokeWidth={2.5} fill="url(#rec)" />
                <Area type="monotone" dataKey="strain" stroke="var(--coral)" strokeWidth={2.5} fill="url(#str)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] hover-lift">
          <h3 className="font-display text-xl mb-4">Risk drivers</h3>
          <ul className="space-y-4">
            {risk.factors.map((f) => (
              <li key={f.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{f.label}</span>
                  <span className="tabular-nums text-muted-foreground">{Math.round(f.impact)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{f.note}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${f.impact}%`,
                      background: f.impact > 60 ? "var(--danger)" : f.impact > 35 ? "var(--coral)" : "var(--success)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

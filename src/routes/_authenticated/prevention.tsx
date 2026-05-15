import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { generateWeek, computeRisk } from "@/lib/health-data";
import { Moon, Droplet, Footprints, Wind, Apple, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "prevention-done-v1";

export const Route = createFileRoute("/_authenticated/prevention")({
  component: Prevention,
});

const icons = [Moon, Droplet, Footprints, Wind, Apple];
const details = [
  "Lower core body temp 30 min before bed: dim lights, cool room (18°C). Avoid screens.",
  "Dehydration spikes resting HR. Aim for pale-yellow urine. Add electrolytes if sweating.",
  "Heavy training while fatigued blunts immunity. Easy walking restores HRV faster.",
  "4-7-8 breathing activates parasympathetic tone — best done lying down before sleep.",
  "Vitamin C, zinc, and polyphenol-rich foods (berries, citrus, leafy greens) support immune response.",
];

function Prevention() {
  const risk = useMemo(() => computeRisk(generateWeek(1)), []);
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {}
  }, [done]);

  const toggle = (i: number) => setDone((d) => ({ ...d, [i]: !d[i] }));
  const reset = () => setDone({});

  const completed = Object.values(done).filter(Boolean).length;
  const total = risk.recommendations.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Your prevention plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Five small actions tailored to your current biosignals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="font-display text-lg tabular-nums">{completed}/{total} · {pct}%</div>
          </div>
          <button
            onClick={reset}
            disabled={completed === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[var(--success,theme(colors.primary))] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {risk.recommendations.map((r, i) => {
          const Icon = icons[i] ?? CheckCircle2;
          const isDone = !!done[i];
          return (
            <div
              key={r}
              className={cn(
                "float-in rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300",
                isDone ? "border-primary/60 bg-primary/5" : "border-border/60",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors",
                    isDone ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-lg">Action {i + 1}</h3>
                    <span className="text-xs text-muted-foreground">~5 min</span>
                  </div>
                  <p className={cn("mt-1 text-sm font-medium text-foreground", isDone && "line-through opacity-70")}>{r}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {details[i]}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-pressed={isDone}
                    className={cn(
                      "mt-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                      isDone
                        ? "bg-primary/15 text-primary hover:bg-primary/20"
                        : "text-primary hover:bg-primary/10",
                    )}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Done — undo
                      </>
                    ) : (
                      <>
                        <Circle className="h-3.5 w-3.5" /> Mark as done
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";
import { generateWeek, computeRisk } from "@/lib/health-data";
import { deriveAlerts, type HealthAlert } from "@/lib/alerts";

export const Route = createFileRoute("/_authenticated/alerts")({
  component: Alerts,
});

const styles: Record<HealthAlert["level"], { color: string; Icon: typeof Bell }> = {
  info: { color: "var(--success)", Icon: Info },
  warning: { color: "var(--coral)", Icon: Bell },
  critical: { color: "var(--danger)", Icon: AlertTriangle },
};

function Alerts() {
  const alerts = useMemo(() => deriveAlerts(computeRisk(generateWeek(1))), []);

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h2 className="font-display text-3xl">Health alerts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Triggered automatically when your biosignals cross safe thresholds.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto text-success" style={{ color: "var(--success)" }} />
          <h3 className="font-display text-xl mt-3">All clear</h3>
          <p className="text-sm text-muted-foreground mt-1">No alerts right now. Keep it up.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => {
            const { color, Icon } = styles[a.level];
            return (
              <li
                key={a.id}
                className="float-in rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-full shrink-0"
                    style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-medium">{a.title}</h4>
                      <span className="text-xs text-muted-foreground">{a.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                    <span
                      className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}
                    >
                      {a.level}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

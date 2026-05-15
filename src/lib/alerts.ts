import type { RiskBreakdown } from "./health-data";

export type HealthAlert = {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  body: string;
  time: string;
};

export function deriveAlerts(risk: RiskBreakdown): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (risk.score >= 70) {
    alerts.push({
      id: "risk-high",
      level: "critical",
      title: "High health risk detected",
      body: `Your composite risk index is ${risk.score}. Multiple biosignals are trending negatively.`,
      time: now,
    });
  } else if (risk.score >= 50) {
    alerts.push({
      id: "risk-elev",
      level: "warning",
      title: "Elevated risk window",
      body: `Risk index ${risk.score}. Consider preventive actions in the next 24h.`,
      time: now,
    });
  }

  for (const f of risk.factors) {
    if (f.impact >= 60) {
      alerts.push({
        id: `f-${f.label}`,
        level: f.impact >= 80 ? "critical" : "warning",
        title: f.label,
        body: f.note,
        time: now,
      });
    }
  }

  for (const p of risk.predictions) {
    if (p.probability >= 65) {
      alerts.push({
        id: `p-${p.title}`,
        level: "warning",
        title: `Likely: ${p.title}`,
        body: `${Math.round(p.probability)}% probability ${p.window}.`,
        time: now,
      });
    }
  }

  return alerts;
}

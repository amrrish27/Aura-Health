import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { generateWeek, computeRisk } from "@/lib/health-data";
import { PredictionCard } from "@/components/health/PredictionCard";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/predictions")({
  component: Predictions,
});

function Predictions() {
  const risk = useMemo(() => computeRisk(generateWeek(1)), []);
  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h2 className="font-display text-3xl">Predicted health events</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI inference · Random Forest + HRV anomaly model
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {risk.predictions.map((p) => (
          <PredictionCard key={p.title} {...p} />
        ))}
      </div>
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 to-accent/30 p-6">
        <h3 className="font-display text-xl">Want to lower these risks?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your personalized prevention plan adapts as your biosignals change.
        </p>
        <Link
          to="/prevention"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Open prevention plan <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

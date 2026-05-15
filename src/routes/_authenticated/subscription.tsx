import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/subscription")({
  component: SubscriptionPage,
});

type PlanId = "free" | "pro";
type BillingCycle = "monthly" | "yearly";

const PRO_MONTHLY = 199;
const PRO_YEARLY = 1600;

function SubscriptionPage() {
  const [selected, setSelected] = useState<PlanId>("free");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const proPrice = cycle === "yearly" ? PRO_YEARLY : PRO_MONTHLY;
  const proPeriod = cycle === "yearly" ? "per year" : "per month";

  const proFeatures = [
    "Everything in Free",
    "30-day predictions & trends",
    "Personalized prevention plan",
    "Real-time alerts (SMS + email)",
    "Unlimited wearable connections",
    "Priority support",
  ];

  const freeFeatures = [
    "Daily risk gauge",
    "7-day wearable history",
    "Basic prevention tips",
    "1 wearable connection",
  ];

  const handleSelect = (id: PlanId) => {
    setSelected(id);
    if (id === "free") toast.success("You're on the Free plan");
    else
      toast.success(
        `Pro ${cycle} selected — ₹${proPrice.toLocaleString()}/${cycle === "yearly" ? "yr" : "mo"}`,
      );
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
      <div className="text-center mb-8 fade-in">
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Choose your plan
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          Predict, prevent, perform. Upgrade anytime — cancel anytime.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
          {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-colors",
                cycle === c
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
              {c === "yearly" && (
                <span className="ml-1 text-[10px] text-primary">save 33%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card
          className={cn(
            "relative p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            selected === "free" && "ring-2 ring-primary",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl">Free</h2>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-semibold tracking-tight">₹0</span>
            <span className="ml-1 text-sm text-muted-foreground">/ forever</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started with core health tracking.
          </p>
          <ul className="mt-5 space-y-2.5 flex-1">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => handleSelect("free")}
            variant="outline"
            className="mt-6 w-full"
          >
            {selected === "free" ? "Selected" : "Current plan"}
          </Button>
        </Card>

        <Card
          className={cn(
            "relative p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-primary/60 shadow-lg",
            selected === "pro" && "ring-2 ring-primary",
          )}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            Most popular
          </span>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl">Pro</h2>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              ₹{proPrice.toLocaleString()}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">/ {proPeriod}</span>
          </div>
          {cycle === "yearly" && (
            <p className="mt-1 text-xs text-primary">
              ~₹{Math.round(PRO_YEARLY / 12)}/mo billed yearly
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Full predictive intelligence with personalized insights.
          </p>
          <ul className="mt-5 space-y-2.5 flex-1">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button onClick={() => handleSelect("pro")} className="mt-6 w-full">
            {selected === "pro" ? "Selected" : "Upgrade to Pro"}
          </Button>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        All prices in INR. Taxes may apply. No hidden fees.
      </p>
    </div>
  );
}

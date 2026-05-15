import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Heart, Loader2, Ruler, Scale, Moon, Briefcase, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

type Form = {
  age: string;
  height_cm: string;
  weight_kg: string;
  sleep_hours: string;
  working_hours: string;
  activity_level: string;
};

const ACTIVITY = [
  { id: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
  { id: "light", label: "Light", desc: "1–3 days / week" },
  { id: "moderate", label: "Moderate", desc: "3–5 days / week" },
  { id: "active", label: "Very active", desc: "6–7 days / week" },
];

function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>({
    age: "",
    height_cm: "",
    weight_kg: "",
    sleep_hours: "7",
    working_hours: "8",
    activity_level: "moderate",
  });

  // Skip onboarding if already done
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded, age, height_cm, weight_kg, sleep_hours, working_hours, activity_level")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.onboarded) {
        navigate({ to: "/dashboard" });
        return;
      }
      if (data) {
        setForm((f) => ({
          age: data.age?.toString() ?? f.age,
          height_cm: data.height_cm?.toString() ?? f.height_cm,
          weight_kg: data.weight_kg?.toString() ?? f.weight_kg,
          sleep_hours: data.sleep_hours?.toString() ?? f.sleep_hours,
          working_hours: data.working_hours?.toString() ?? f.working_hours,
          activity_level: data.activity_level ?? f.activity_level,
        }));
      }
      setLoading(false);
    })();
  }, [user, navigate]);

  const bmi = useMemo(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (!h || !w || h <= 0) return null;
    return w / Math.pow(h / 100, 2);
  }, [form.height_cm, form.weight_kg]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", color: "var(--coral, #f59e0b)" };
    if (bmi < 25) return { label: "Healthy", color: "var(--success, #10b981)" };
    if (bmi < 30) return { label: "Overweight", color: "var(--coral, #f59e0b)" };
    return { label: "Obese", color: "var(--danger, #ef4444)" };
  }, [bmi]);

  const update = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const age = parseInt(form.age);
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    const sh = parseFloat(form.sleep_hours);
    const wh = parseFloat(form.working_hours);
    if (!age || age < 5 || age > 120) return toast.error("Please enter a valid age (5–120).");
    if (!h || h < 80 || h > 260) return toast.error("Please enter a valid height in cm.");
    if (!w || w < 20 || w > 400) return toast.error("Please enter a valid weight in kg.");
    if (!sh || sh < 0 || sh > 24) return toast.error("Sleep hours must be between 0 and 24.");
    if (!wh || wh < 0 || wh > 24) return toast.error("Working hours must be between 0 and 24.");

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        age,
        height_cm: h,
        weight_kg: w,
        sleep_hours: sh,
        working_hours: wh,
        activity_level: form.activity_level,
        onboarded: true,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved. Welcome aboard!");
    navigate({ to: "/dashboard" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto fade-in">
      <div className="text-center mb-8 slide-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> One-time setup
        </div>
        <h1 className="font-display text-3xl md:text-4xl mt-3">
          Tell us about <em className="not-italic gradient-text">you</em>
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          We use these to personalize your risk model. Takes under a minute.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur p-6 md:p-8 shadow-[var(--shadow-card)] space-y-6 scale-in"
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <Field icon={Heart} label="Age" suffix="yrs">
            <Input type="number" min={5} max={120} value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="28" required />
          </Field>
          <Field icon={Ruler} label="Height" suffix="cm">
            <Input type="number" step="0.1" min={80} max={260} value={form.height_cm} onChange={(e) => update("height_cm", e.target.value)} placeholder="172" required />
          </Field>
          <Field icon={Scale} label="Weight" suffix="kg">
            <Input type="number" step="0.1" min={20} max={400} value={form.weight_kg} onChange={(e) => update("weight_kg", e.target.value)} placeholder="68" required />
          </Field>
        </div>

        {/* BMI live card */}
        <div
          className="rounded-2xl border border-border/60 bg-gradient-to-br from-accent/30 to-card p-5 transition-all"
          style={bmiCategory ? { borderColor: bmiCategory.color } : undefined}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Body Mass Index</p>
              <p className="font-display text-3xl mt-1 tabular-nums">
                {bmi ? bmi.toFixed(1) : "—"}
              </p>
            </div>
            {bmiCategory && (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ background: bmiCategory.color }}
              >
                {bmiCategory.label}
              </span>
            )}
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: bmi ? `${Math.min(100, (bmi / 40) * 100)}%` : "0%",
                background: bmiCategory?.color ?? "var(--primary)",
              }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Healthy range: 18.5 – 24.9
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field icon={Moon} label="Avg sleep" suffix="hrs / night">
            <Input type="number" step="0.5" min={0} max={24} value={form.sleep_hours} onChange={(e) => update("sleep_hours", e.target.value)} required />
          </Field>
          <Field icon={Briefcase} label="Working time" suffix="hrs / day">
            <Input type="number" step="0.5" min={0} max={24} value={form.working_hours} onChange={(e) => update("working_hours", e.target.value)} required />
          </Field>
        </div>

        <div>
          <Label className="mb-2 block flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-primary" /> Activity level
          </Label>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {ACTIVITY.map((a) => {
              const active = form.activity_level === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => update("activity_level", a.id)}
                  className={`rounded-xl border p-3 text-left text-sm transition-all hover-lift ${
                    active
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div className="font-medium">{a.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-gradient w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium hover-lift disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {saving ? "Saving…" : "Continue to dashboard"}
        </button>
      </form>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  suffix,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-primary" /> {label}
        {suffix && <span className="text-xs text-muted-foreground font-normal ml-auto">{suffix}</span>}
      </Label>
      {children}
    </div>
  );
}

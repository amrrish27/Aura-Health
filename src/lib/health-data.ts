// Simulated wearable data + lightweight risk model (MVP)
export type DayMetric = {
  day: string;
  sleepHours: number;
  sleepQuality: number; // 0-100
  steps: number;
  restingHr: number;
  hrv: number; // ms
  mood: number; // 1-5
  fatigue: number; // 1-5
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function generateWeek(seed = 1): DayMetric[] {
  // Subtle declining trend (the "micro-changes" before illness)
  return DAYS.map((day, i) => {
    const drift = i / 6;
    return {
      day,
      sleepHours: +(7.4 - drift * 1.6 + (Math.sin(i + seed) * 0.2)).toFixed(1),
      sleepQuality: Math.round(86 - drift * 28 + Math.cos(i) * 3),
      steps: Math.round(8800 - drift * 4200 + Math.sin(i * 1.3) * 400),
      restingHr: Math.round(62 + drift * 11 + Math.sin(i) * 1.2),
      hrv: Math.round(58 - drift * 18 + Math.cos(i * 0.7) * 2),
      mood: +(4.4 - drift * 1.6).toFixed(1),
      fatigue: +(1.6 + drift * 2.4).toFixed(1),
    };
  });
}

export type RiskBreakdown = {
  score: number; // 0-100, higher = more risk
  band: "Low" | "Moderate" | "Elevated" | "High";
  factors: { label: string; impact: number; note: string }[];
  predictions: { title: string; probability: number; window: string; reason: string }[];
  recommendations: string[];
};

export function computeRisk(week: DayMetric[]): RiskBreakdown {
  const last = week[week.length - 1];
  const first = week[0];

  const sleepDelta = first.sleepHours - last.sleepHours;
  const stepsDelta = (first.steps - last.steps) / first.steps;
  const hrDelta = last.restingHr - first.restingHr;
  const hrvDelta = first.hrv - last.hrv;
  const moodDelta = first.mood - last.mood;

  const factors = [
    { label: "Sleep decline", impact: Math.min(100, Math.max(0, sleepDelta * 28)), note: `${sleepDelta.toFixed(1)}h less than week start` },
    { label: "Activity drop", impact: Math.min(100, Math.max(0, stepsDelta * 100)), note: `${Math.round(stepsDelta * 100)}% fewer steps` },
    { label: "Resting HR rise", impact: Math.min(100, Math.max(0, hrDelta * 6)), note: `+${hrDelta} bpm above baseline` },
    { label: "HRV reduction", impact: Math.min(100, Math.max(0, hrvDelta * 4)), note: `-${hrvDelta} ms HRV` },
    { label: "Mood / fatigue", impact: Math.min(100, Math.max(0, moodDelta * 20)), note: `mood ${moodDelta.toFixed(1)} pts lower` },
  ];

  const score = Math.round(
    factors.reduce((s, f) => s + f.impact, 0) / factors.length
  );

  const band: RiskBreakdown["band"] =
    score < 25 ? "Low" : score < 50 ? "Moderate" : score < 70 ? "Elevated" : "High";

  const predictions = [
    {
      title: "Viral infection (cold / flu-like)",
      probability: Math.min(92, 30 + score * 0.7),
      window: "next 48–72 hours",
      reason: "Elevated resting HR + reduced HRV + sleep loss is a classic pre-illness pattern.",
    },
    {
      title: "Burnout / stress episode",
      probability: Math.min(88, 20 + score * 0.6),
      window: "next 5–7 days",
      reason: "Sustained mood decline with rising fatigue and lower activity.",
    },
    {
      title: "Migraine likelihood",
      probability: Math.min(70, 10 + score * 0.45),
      window: "next 36 hours",
      reason: "Poor sleep quality and HRV drop correlate with migraine onset.",
    },
  ];

  const recommendations = [
    "Aim for 8h of sleep tonight — go to bed 45 min earlier.",
    "Hydrate: 500 ml water now, then every 2 hours.",
    "Skip intense workouts today; choose a 20-min walk instead.",
    "Add 10 min of slow breathing (4-7-8) to recover HRV.",
    "Eat vitamin-C rich foods and avoid alcohol for 2 days.",
  ];

  return { score, band, factors, predictions, recommendations };
}

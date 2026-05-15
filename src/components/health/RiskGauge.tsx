import { useAnimatedNumber } from "@/hooks/use-animated-number";

type Props = { score: number; band: string };

export function RiskGauge({ score, band }: Props) {
  const radius = 92;
  const circumference = Math.PI * radius;
  const animated = useAnimatedNumber(score, 1100);
  const offset = circumference - (animated / 100) * circumference;

  const color =
    animated < 25 ? "var(--success)" : animated < 50 ? "var(--warning)" : animated < 70 ? "var(--coral)" : "var(--danger)";

  return (
    <div className="relative flex flex-col items-center">
      <svg width="240" height="140" viewBox="0 0 240 140" className="overflow-visible">
        <defs>
          <linearGradient id="gauge" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--success)" />
            <stop offset="50%" stopColor="var(--warning)" />
            <stop offset="100%" stopColor="var(--danger)" />
          </linearGradient>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M 28 120 A ${radius} ${radius} 0 0 1 212 120`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M 28 120 A ${radius} ${radius} 0 0 1 212 120`}
          fill="none"
          stroke="url(#gauge)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#gauge-glow)"
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)",
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
        {/* Animated tick indicator */}
        {(() => {
          const angle = Math.PI - (animated / 100) * Math.PI;
          const cx = 120 + radius * Math.cos(angle);
          const cy = 120 - radius * Math.sin(angle);
          return (
            <g style={{ transition: "transform 0.4s ease" }}>
              <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.25} />
              <circle cx={cx} cy={cy} r={5} fill={color} />
              <circle cx={cx} cy={cy} r={2} fill="var(--card)" />
            </g>
          );
        })()}
      </svg>
      <div className="-mt-16 flex flex-col items-center">
        <span
          className="font-display text-6xl tabular-nums transition-colors duration-500"
          style={{ color }}
          aria-live="polite"
        >
          {Math.round(animated)}
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1 transition-opacity">
          {band} risk
        </span>
      </div>
    </div>
  );
}

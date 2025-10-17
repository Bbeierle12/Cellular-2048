interface EnergyRingProps {
  energy: number;
  threshold?: number;
  streak?: number;
}

export function EnergyRing({ energy, threshold = 100, streak = 0 }: EnergyRingProps): JSX.Element {
  const progress = Math.min(energy / threshold, 1);
  const circumference = 2 * Math.PI * 45; // radius of 45
  const offset = circumference * (1 - progress);

  return (
    <div className="energy-ring">
      <svg viewBox="0 0 100 100" className="ring-svg">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--cell-alive)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="ring-progress"
        />
      </svg>
      <div className="ring-content">
        <div className="ring-energy">{energy}</div>
        {streak > 0 && <div className="ring-streak">×{streak}</div>}
      </div>
    </div>
  );
}

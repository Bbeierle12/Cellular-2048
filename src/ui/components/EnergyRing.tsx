interface EnergyRingProps {
  energy: number;
  threshold?: number;
  streak?: number;
}

export function EnergyRing({ energy, threshold = 100, streak = 0 }: EnergyRingProps): JSX.Element {
  const radius = 32;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = Math.min(energy / threshold, 1);
  const strokeDashoffset = circumference - progress * circumference;

  // Change color based on progress
  const progressColor = progress >= 1 ? "#4caf50" : progress >= 0.7 ? "#ffc107" : "#48b2ff";

  const progressPercent = Math.round(progress * 100);
  const streakText = streak > 0 ? `, streak multiplier ${streak}` : "";

  return (
    <div 
      className="energy-ring" 
      role="status" 
      aria-label={`Energy level: ${energy} out of ${threshold}, ${progressPercent}% to stabilization${streakText}`}
      aria-live="polite"
    >
      <svg 
        className="ring-svg" 
        width={radius * 2} 
        height={radius * 2}
        role="img"
        aria-label={`Energy progress ring showing ${progressPercent}% progress`}
      >
        <title>Energy Progress</title>
        {/* Background circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          aria-hidden="true"
        />
        {/* Progress circle */}
        <circle
          className="ring-progress"
          stroke={progressColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
          aria-hidden="true"
        />
      </svg>
      <div className="ring-content" aria-hidden="true">
        <div className="ring-energy">{energy}</div>
        {streak > 0 && <div className="ring-streak">×{streak}</div>}
      </div>
    </div>
  );
}

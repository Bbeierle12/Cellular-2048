export interface ScorePanelProps {
  score: number;
  multiplier: number;
}

export function ScorePanel({ score, multiplier }: ScorePanelProps): JSX.Element {
  return (
    <aside className="score-panel">
      <div>Score: {score}</div>
      <div>Multiplier: {multiplier.toFixed(1)}x</div>
    </aside>
  );
}

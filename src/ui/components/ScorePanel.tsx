export interface ScorePanelProps {
  score: number;
  multiplier: number;
  streak?: number;
  turnNumber?: number;
  totalEnergy?: number;
  isGameOver?: boolean;
  hasWon?: boolean;
}

export function ScorePanel({
  score,
  multiplier,
  streak = 0,
  turnNumber = 0,
  totalEnergy = 0,
  isGameOver = false,
  hasWon = false
}: ScorePanelProps): JSX.Element {
  return (
    <aside className="score-panel">
      <div className="score-main">
        <span className="label">Score</span>
        <span className="value">{score.toLocaleString()}</span>
      </div>
      <div className="score-detail">
        <div>
          <span className="label">Multiplier:</span> {multiplier.toFixed(2)}x
        </div>
        {streak > 0 && (
          <div>
            <span className="label">Streak:</span> {streak}
          </div>
        )}
        <div>
          <span className="label">Turn:</span> {turnNumber}
        </div>
        <div>
          <span className="label">Energy:</span> {totalEnergy}
        </div>
      </div>
      {hasWon && <div className="status-win">🎉 You Win!</div>}
      {isGameOver && !hasWon && <div className="status-gameover">Game Over</div>}
    </aside>
  );
}

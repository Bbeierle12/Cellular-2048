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
    <aside className="score-panel" role="complementary" aria-label="Game statistics">
      <div className="score-main" role="status" aria-live="polite">
        <span className="label" id="score-label">Score</span>
        <span className="value" aria-labelledby="score-label">
          {score.toLocaleString()}
        </span>
      </div>
      <div className="score-detail" role="group" aria-label="Game details">
        <div>
          <span className="label">Multiplier:</span>{" "}
          <span aria-label={`Score multiplier ${multiplier.toFixed(2)}`}>
            {multiplier.toFixed(2)}x
          </span>
        </div>
        {streak > 0 && (
          <div>
            <span className="label">Streak:</span>{" "}
            <span aria-label={`Current streak ${streak}`}>{streak}</span>
          </div>
        )}
        <div>
          <span className="label">Turn:</span>{" "}
          <span aria-label={`Turn number ${turnNumber}`}>{turnNumber}</span>
        </div>
        <div>
          <span className="label">Energy:</span>{" "}
          <span aria-label={`Total energy ${totalEnergy}`}>{totalEnergy}</span>
        </div>
      </div>
      {hasWon && (
        <div className="status-win" role="alert" aria-live="assertive">
          🎉 You Win!
        </div>
      )}
      {isGameOver && !hasWon && (
        <div className="status-gameover" role="alert" aria-live="assertive">
          Game Over
        </div>
      )}
    </aside>
  );
}

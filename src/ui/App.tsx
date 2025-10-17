import { useMemo } from "react";
import { GameBoard } from "./components/GridCanvas";
import "./styles/layout.css";

export function App(): JSX.Element {
  const version = useMemo(() => "0.1.0-phase5", []);

  return (
    <main className="app-shell" role="main" aria-label="Cellular 2048 Game">
      <header className="app-header" role="banner">
        <h1 id="game-title">Cellular 2048</h1>
        <span className="build-version" aria-label={`Version ${version}`}>v{version}</span>
        <p className="instructions" role="note" aria-label="Game controls">
          Use arrow keys or WASD to swipe. Press <kbd aria-label="R key">R</kbd> to reset. Press <kbd aria-label="G key">G</kbd> to toggle Life preview. Press <kbd aria-label="M key">M</kbd> to toggle mode.
        </p>
      </header>
      <section className="board-area" role="region" aria-label="Game board area">
        <GameBoard />
      </section>
    </main>
  );
}

export default App;

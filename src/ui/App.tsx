import { useMemo } from "react";
import { GameBoard } from "./components/GridCanvas";
import "./styles/layout.css";

export function App(): JSX.Element {
  const version = useMemo(() => "0.1.0-phase4", []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Cellular 2048</h1>
        <span className="build-version">v{version}</span>
        <p className="instructions">Use arrow keys or WASD to swipe. Press R to reset.</p>
      </header>
      <section className="board-area">
        <GameBoard />
      </section>
    </main>
  );
}

export default App;

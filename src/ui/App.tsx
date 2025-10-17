import { useMemo } from "react";
import { GameBoard } from "./components/GridCanvas";
import "./styles/layout.css";

export function App(): JSX.Element {
  const version = useMemo(() => "0.1.0-dev", []);

  return (
    <main className="app-shell">
      <header>
        <h1>Cellular 2048</h1>
        <span className="build-version">Build {version}</span>
      </header>
      <section className="board-area">
        <GameBoard />
      </section>
    </main>
  );
}

export default App;

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GameBoard } from "../../../src/ui/components/GridCanvas";

describe("GameBoard", () => {
  it("renders game board with canvas and controls", () => {
    const { container } = render(<GameBoard />);
    const canvas = container.querySelector(".grid-canvas");
    expect(canvas).toBeTruthy();
    
    const scorePanel = container.querySelector(".score-panel");
    expect(scorePanel).toBeTruthy();
    
    const energyRing = container.querySelector(".energy-ring");
    expect(energyRing).toBeTruthy();
  });
});

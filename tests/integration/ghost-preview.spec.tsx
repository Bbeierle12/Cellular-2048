import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GhostPreview } from "../../src/ui/components/GhostPreview";
import { createGrid } from "../../src/engine/grid/grid";
import { createSeededRng } from "../../src/engine/rng/seed";
import { createAliveCell } from "../../src/engine/grid/cell";

describe("GhostPreview", () => {
  it("renders without errors when provided grid and options", () => {
    const rng = createSeededRng(12345);
    const grid = createGrid({ rows: 6, cols: 6 }, rng);
    const lifeOptions = {
      name: "early",
      boardSize: 6,
      eCap: 8,
      birthRule: "2-3" as const,
      blight: "off" as const,
      decay: "off" as const,
      catalystRate: "low" as const,
      stabilizeThreshold: 25
    };
    
    const { container } = render(
      <GhostPreview 
        grid={grid} 
        lifeOptions={lifeOptions}
        cellSize={50}
        visible={true}
      />
    );
    expect(container).toBeTruthy();
  });

  it("returns null when visible is false", () => {
    const rng = createSeededRng(12345);
    const grid = createGrid({ rows: 4, cols: 4 }, rng);
    const lifeOptions = {
      name: "early",
      boardSize: 4,
      eCap: 8,
      birthRule: "2-3" as const,
      blight: "off" as const,
      decay: "off" as const,
      catalystRate: "low" as const,
      stabilizeThreshold: 25
    };
    
    const { container } = render(
      <GhostPreview 
        grid={grid} 
        lifeOptions={lifeOptions}
        cellSize={50}
        visible={false}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows birth indicators for cells that will be born", () => {
    const rng = createSeededRng(12345);
    const grid = createGrid({ rows: 4, cols: 4 }, rng);
    
    // Create a pattern that will generate births (L-shape creates births)
    grid[0][0] = createAliveCell(2);
    grid[0][1] = createAliveCell(2);
    grid[1][0] = createAliveCell(2);
    
    const lifeOptions = {
      name: "early",
      boardSize: 4,
      eCap: 8,
      birthRule: "2-3" as const,
      blight: "off" as const,
      decay: "off" as const,
      catalystRate: "low" as const,
      stabilizeThreshold: 25
    };
    
    const { container } = render(
      <GhostPreview 
        grid={grid} 
        lifeOptions={lifeOptions}
        cellSize={50}
        visible={true}
      />
    );
    
    // Should render SVG with circle elements for births
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThan(0);
  });

  it("shows death indicators for cells that will die", () => {
    const rng = createSeededRng(12345);
    const grid = createGrid({ rows: 4, cols: 4 }, rng);
    
    // Single isolated cell will die
    grid[2][2] = createAliveCell(2);
    
    const lifeOptions = {
      name: "early",
      boardSize: 4,
      eCap: 8,
      birthRule: "2-3" as const,
      blight: "off" as const,
      decay: "off" as const,
      catalystRate: "low" as const,
      stabilizeThreshold: 25
    };
    
    const { container } = render(
      <GhostPreview 
        grid={grid} 
        lifeOptions={lifeOptions}
        cellSize={50}
        visible={true}
      />
    );
    
    // Should render SVG with line elements for deaths (X marks)
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBeGreaterThan(0);
  });
});

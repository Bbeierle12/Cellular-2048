import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GhostPreview } from "../../src/ui/components/GhostPreview";
import { createGrid } from "../../src/engine/grid/grid";
import { createSeededRng } from "../../src/engine/rng/seed";

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
    
    const { container } = render(<GhostPreview grid={grid} lifeOptions={lifeOptions} />);
    // Ghost preview currently returns null, so just verify no crash
    expect(container).toBeTruthy();
  });
});

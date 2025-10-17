import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GameBoard } from "../../../src/ui/components/GridCanvas";

describe("GameBoard", () => {
  it("renders ghost preview and energy ring placeholders", () => {
    const { getByText } = render(<GameBoard />);
    expect(getByText(/Ghost preview pending/i)).toBeTruthy();
    expect(getByText(/E:1/)).toBeTruthy();
  });
});

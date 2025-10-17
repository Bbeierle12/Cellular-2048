import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScorePanel } from "../../../src/ui/components/ScorePanel";

describe("ScorePanel", () => {
  it("renders score and multiplier", () => {
    const { getByText } = render(<ScorePanel score={123} multiplier={2} />);
    expect(getByText(/Score: 123/)).toBeTruthy();
    expect(getByText(/Multiplier: 2.0x/)).toBeTruthy();
  });
});

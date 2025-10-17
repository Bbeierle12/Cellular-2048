import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScorePanel } from "../../../src/ui/components/ScorePanel";

describe("ScorePanel", () => {
  it("renders score and multiplier", () => {
    const { getByText } = render(<ScorePanel score={123} multiplier={2.0} />);
    expect(getByText("123")).toBeTruthy();
    expect(getByText(/2.00x/)).toBeTruthy();
  });
});

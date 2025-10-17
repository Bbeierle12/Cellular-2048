import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../src/ui/App";

describe("App", () => {
  it("renders title and board shell", () => {
    const { getByText } = render(<App />);
    expect(getByText("Cellular 2048")).toBeTruthy();
    expect(getByText(/v0.1.0-phase4/)).toBeTruthy();
    expect(getByText(/Use arrow keys/)).toBeTruthy();
  });
});

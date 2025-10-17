import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../src/ui/App";

describe("App", () => {
  it("renders title and board shell", () => {
    const { getByText } = render(<App />);
    expect(getByText("Cellular 2048")).toBeTruthy();
    expect(getByText(/Build 0.1.0-dev/)).toBeTruthy();
    expect(getByText(/Ghost preview pending/i)).toBeTruthy();
  });
});

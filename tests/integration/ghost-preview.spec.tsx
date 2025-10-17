import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GhostPreview } from "../../src/ui/components/GhostPreview";

describe("GhostPreview", () => {
  it("renders placeholder content", () => {
    const { getByText } = render(<GhostPreview />);
    expect(getByText(/Ghost preview/i)).toBeTruthy();
  });
});

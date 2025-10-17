import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnergyRing } from "../../../src/ui/components/EnergyRing";

describe("EnergyRing", () => {
  it("renders energy text", () => {
    const { getByText } = render(<EnergyRing energy={5} />);
    expect(getByText("E:5")).toBeTruthy();
  });
});

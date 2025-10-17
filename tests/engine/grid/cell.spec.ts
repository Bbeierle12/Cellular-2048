import { describe, expect, it } from "vitest";

import {
  cloneCell,
  createAliveCell,
  createCatalystCell,
  createDormantCell,
  createEmptyCell,
  isAlive,
  isDormant
} from "../../../src/engine/grid/cell";

describe("cell helpers", () => {
  it("creates alive cell with provided energy", () => {
    const cell = createAliveCell(3);
    expect(cell).toEqual({ state: "alive", energy: 3 });
    expect(isAlive(cell)).toBe(true);
    expect(isDormant(cell)).toBe(false);
  });

  it("creates dormant cell with counters reset", () => {
    const cell = createDormantCell(2);
    expect(cell.state).toBe("dormant");
    expect(cell.energy).toBe(2);
    expect(cell.noMergeTicks).toBe(0);
    expect(isDormant(cell)).toBe(true);
  });

  it("creates empty cell with zero energy", () => {
    const cell = createEmptyCell();
    expect(cell).toEqual({ state: "empty", energy: 0 });
    expect(isAlive(cell)).toBe(false);
    expect(isDormant(cell)).toBe(false);
  });

  it("creates catalyst cell without energy changes", () => {
    const cell = createCatalystCell();
    expect(cell).toEqual({ state: "catalyst", energy: 0 });
  });

  it("clones cells to a different reference", () => {
    const original = createAliveCell(4);
    original.noMergeTicks = 2;
    const cloned = cloneCell(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });
});

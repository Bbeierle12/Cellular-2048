import { describe, expect, it } from "vitest";

import { rotateMatrixClockwise } from "../../src/utils/matrix";

describe("rotateMatrixClockwise", () => {
  it("rotates rectangular matrices", () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6]
    ];

    const rotated = rotateMatrixClockwise(matrix);

    expect(rotated).toEqual([
      [4, 1],
      [5, 2],
      [6, 3]
    ]);
  });

  it("handles single row matrices", () => {
    const matrix = [[1, 2]];
    expect(rotateMatrixClockwise(matrix)).toEqual([[1], [2]]);
  });
});

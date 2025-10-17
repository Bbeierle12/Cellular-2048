export function rotateMatrixClockwise<T>(matrix: T[][]): T[][] {
  const height = matrix.length;
  const width = matrix[0]?.length ?? 0;
  return Array.from({ length: width }, (_, x) =>
    Array.from({ length: height }, (_, y) => matrix[height - 1 - y][x])
  );
}

import type { Grid } from "../../engine/grid/grid";
import type { DifficultyConfig } from "../../state/types";
import { lifeTick } from "../../engine/lifecycle/life-tick";
import { isAlive } from "../../engine/grid/cell";

interface GhostPreviewProps {
  grid: Grid;
  lifeOptions: DifficultyConfig;
  cellSize: number;
  visible: boolean;
}

export function GhostPreview({ grid, lifeOptions, cellSize, visible }: GhostPreviewProps): JSX.Element | null {
  if (!visible) return null;

  // Calculate next Life tick to preview changes
  const birthRule = lifeOptions.birthRule.split("-").map(Number);
  const result = lifeTick(grid, { birthNeighbors: birthRule });

  const births: Array<{ row: number; col: number }> = [];
  const deaths: Array<{ row: number; col: number }> = [];

  // Compare current grid to predicted grid
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const currentAlive = isAlive(grid[row][col]);
      const nextAlive = isAlive(result.grid[row][col]);

      if (!currentAlive && nextAlive) {
        births.push({ row, col });
      } else if (currentAlive && !nextAlive) {
        deaths.push({ row, col });
      }
    }
  }

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10
      }}
      role="img"
      aria-label={`Life preview: ${births.length} cells will be born, ${deaths.length} cells will die`}
    >
      <title>Conway's Life Preview</title>
      <desc>
        Shows predictions for the next Life tick. Green circles indicate cells that will be born. Red X marks indicate cells that will die.
      </desc>
      {/* Birth indicators: green circles */}
      {births.map(({ row, col }) => (
        <circle
          key={`birth-${row}-${col}`}
          cx={col * cellSize + cellSize / 2}
          cy={row * cellSize + cellSize / 2}
          r={cellSize * 0.35}
          fill="rgba(76, 175, 80, 0.3)"
          stroke="rgba(76, 175, 80, 0.6)"
          strokeWidth="2"
          aria-label={`Cell at row ${row}, column ${col} will be born`}
        >
          <animate
            attributeName="r"
            values={`0;${cellSize * 0.35};${cellSize * 0.35}`}
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Death indicators: red X marks */}
      {deaths.map(({ row, col }) => {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        const size = cellSize * 0.3;
        return (
          <g 
            key={`death-${row}-${col}`} 
            opacity="0.5"
            aria-label={`Cell at row ${row}, column ${col} will die`}
          >
            <line
              x1={x - size}
              y1={y - size}
              x2={x + size}
              y2={y + size}
              stroke="rgba(244, 67, 54, 0.8)"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <animate
                attributeName="opacity"
                values="0.5;1;0.5"
                dur="1s"
                repeatCount="indefinite"
              />
            </line>
            <line
              x1={x + size}
              y1={y - size}
              x2={x - size}
              y2={y + size}
              stroke="rgba(244, 67, 54, 0.8)"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <animate
                attributeName="opacity"
                values="0.5;1;0.5"
                dur="1s"
                repeatCount="indefinite"
              />
            </line>
          </g>
        );
      })}
    </svg>
  );
}

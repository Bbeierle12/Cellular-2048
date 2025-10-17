import { useRef, useEffect, useCallback, useState } from "react";
import { useGameState, selectBoardSnapshot, createSwipeAction } from "../../state";
import type { BoardSnapshot, SerializedCell } from "../../state";
import { GhostPreview } from "./GhostPreview";
import { EnergyRing } from "./EnergyRing";
import { ScorePanel } from "./ScorePanel";
import palette from "../assets/palette.json";

const CELL_GAP = 4;
const CELL_RADIUS = 8;
const PADDING = 16;

export function GameBoard(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, dispatch] = useGameState();
  const boardSnapshot = selectBoardSnapshot(state);
  const [showGhostPreview, setShowGhostPreview] = useState(false);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, "N" | "E" | "S" | "W"> = {
        ArrowUp: "N",
        ArrowRight: "E",
        ArrowDown: "S",
        ArrowLeft: "W",
        w: "N",
        W: "N",
        d: "E",
        D: "E",
        s: "S",
        S: "S",
        a: "W",
        A: "W"
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        dispatch(createSwipeAction(direction));
      }

      // Reset on R key
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        dispatch({ type: "RESET" });
      }

      // Toggle ghost preview on G key
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        setShowGhostPreview((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  // Handle touch/mouse swipe
  const handleSwipe = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      const dirMap = {
        up: "N" as const,
        down: "S" as const,
        left: "W" as const,
        right: "E" as const
      };
      dispatch(createSwipeAction(dirMap[direction]));
    },
    [dispatch]
  );

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw grid
    drawGrid(ctx, boardSnapshot, rect.width, rect.height);
  }, [boardSnapshot]);

  return (
    <div className="game-board-container">
      <ScorePanel
        score={state.score}
        multiplier={state.streakState.multiplier}
        streak={state.streakState.streak}
        turnNumber={state.turnNumber}
        totalEnergy={state.totalEnergy}
        isGameOver={state.isGameOver}
        hasWon={state.hasWon}
      />
      <div 
        className="game-board" 
        onPointerDown={(e) => handleSwipeStart(e, handleSwipe)}
        role="application"
        aria-label="Game grid: Use arrow keys or WASD to swipe cells"
        tabIndex={0}
      >
        <canvas 
          ref={canvasRef} 
          className="grid-canvas"
          role="img"
          aria-label={`Game grid with ${state.grid.length} by ${state.grid[0]?.length || 0} cells`}
        />
        <GhostPreview
          grid={state.grid}
          lifeOptions={state.difficulty}
          cellSize={calculateCellSize(state.grid.length, state.grid[0]?.length || 0)}
          visible={showGhostPreview}
        />
        <EnergyRing
          energy={state.totalEnergy}
          threshold={state.difficulty.stabilizeThreshold}
          streak={state.streakState.streak}
        />
      </div>
    </div>
  );
}

// Calculate cell size based on grid dimensions
// This matches the calculation in drawGrid
function calculateCellSize(rows: number, cols: number): number {
  // Use typical canvas size (adjust if needed)
  const canvasSize = 600; // Approximate canvas size
  const availableWidth = canvasSize - PADDING * 2 - CELL_GAP * (cols - 1);
  const availableHeight = canvasSize - PADDING * 2 - CELL_GAP * (rows - 1);
  return Math.min(availableWidth / cols, availableHeight / rows);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  snapshot: BoardSnapshot,
  width: number,
  height: number
): void {
  const { width: cols, height: rows, cells } = snapshot;

  // Calculate cell size
  const availableWidth = width - PADDING * 2 - CELL_GAP * (cols - 1);
  const availableHeight = height - PADDING * 2 - CELL_GAP * (rows - 1);
  const cellSize = Math.min(availableWidth / cols, availableHeight / rows);

  // Center the grid
  const gridWidth = cellSize * cols + CELL_GAP * (cols - 1);
  const gridHeight = cellSize * rows + CELL_GAP * (rows - 1);
  const offsetX = (width - gridWidth) / 2;
  const offsetY = (height - gridHeight) / 2;

  // Draw each cell
  for (const cell of cells) {
    const x = offsetX + cell.x * (cellSize + CELL_GAP);
    const y = offsetY + cell.y * (cellSize + CELL_GAP);

    drawCell(ctx, cell, x, y, cellSize);
  }
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  cell: SerializedCell,
  x: number,
  y: number,
  size: number
): void {
  // Get color based on cell kind
  const color = getCellColor(cell);

  // Draw cell background
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, CELL_RADIUS);
  ctx.fill();

  // Draw energy value for alive/dormant cells
  if ((cell.kind === "alive" || cell.kind === "dormant") && cell.energy > 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = `bold ${size * 0.4}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cell.energy.toString(), x + size / 2, y + size / 2);
  }

  // Draw indicator for catalyst
  if (cell.kind === "catalyst") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = `bold ${size * 0.5}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("×2", x + size / 2, y + size / 2);
  }

  // Draw indicator for blight
  if (cell.kind === "blight") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = `bold ${size * 0.4}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", x + size / 2, y + size / 2);
  }

  // Highlight merged cells
  if (cell.mergedThisSwipe) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, CELL_RADIUS);
    ctx.stroke();
  }
}

function getCellColor(cell: SerializedCell): string {
  switch (cell.kind) {
    case "alive":
      return palette.alive;
    case "dormant":
      return palette.dormant;
    case "blight":
      return palette.blight;
    case "catalyst":
      return palette.catalyst;
    case "empty":
    default:
      return palette.empty;
  }
}

// Swipe gesture detection
let swipeStartX = 0;
let swipeStartY = 0;
const MIN_SWIPE_DISTANCE = 30;

function handleSwipeStart(
  e: React.PointerEvent,
  callback: (direction: "up" | "down" | "left" | "right") => void
): void {
  swipeStartX = e.clientX;
  swipeStartY = e.clientY;

  const handleSwipeEnd = (endEvent: Event) => {
    const pointerEvent = endEvent as unknown as React.PointerEvent;
    const deltaX = pointerEvent.clientX - swipeStartX;
    const deltaY = pointerEvent.clientY - swipeStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > MIN_SWIPE_DISTANCE || absDeltaY > MIN_SWIPE_DISTANCE) {
      if (absDeltaX > absDeltaY) {
        callback(deltaX > 0 ? "right" : "left");
      } else {
        callback(deltaY > 0 ? "down" : "up");
      }
    }

    (e.target as EventTarget).removeEventListener("pointerup", handleSwipeEnd);
    (e.target as EventTarget).removeEventListener("pointercancel", handleSwipeEnd);
  };

  (e.target as EventTarget).addEventListener("pointerup", handleSwipeEnd);
  (e.target as EventTarget).addEventListener("pointercancel", handleSwipeEnd);
}


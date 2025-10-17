import { useRef, useEffect } from "react";
import type { ParticleField, Particle } from "../../engine/particle";
import palette from "../assets/palette.json";

interface ParticleCanvasProps {
  field: ParticleField;
  width: number;
  height: number;
  showTrails?: boolean;
}

export function ParticleCanvas({
  field,
  width,
  height,
  showTrails = true
}: ParticleCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<Map<string, Array<{ x: number; y: number }>>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw trails first (behind particles)
    if (showTrails) {
      drawTrails(ctx, field, width, height, trailsRef.current);
    }

    // Draw particles
    for (const particle of field) {
      drawParticle(ctx, particle, width, height);
    }

    // Update trails
    updateTrails(field, trailsRef.current);
  }, [field, width, height, showTrails]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="particle-canvas"
    />
  );
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  canvasWidth: number,
  canvasHeight: number
): void {
  const x = particle.x * canvasWidth;
  const y = particle.y * canvasHeight;
  const radius = particle.radius * canvasWidth;

  // Get color based on particle state
  const color = getParticleColor(particle);

  // Draw glow effect
  if (particle.state === "alive") {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
    gradient.addColorStop(0, `${color}80`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw particle body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw merge animation
  if (particle.mergeAnimation && particle.mergeAnimation > 0) {
    const animRadius = radius * (1 + particle.mergeAnimation);
    ctx.strokeStyle = `rgba(255, 255, 255, ${particle.mergeAnimation * 0.8})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, animRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw energy value for alive particles
  if (particle.state === "alive" && particle.energy > 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = `bold ${radius * 1.2}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(particle.energy.toString(), x, y);
  }

  // Draw special symbols
  if (particle.state === "catalyst") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = `bold ${radius * 1.3}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("×2", x, y);
  }

  if (particle.state === "blight") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = `bold ${radius * 1.3}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", x, y);
  }

  // Draw velocity indicator (debug)
  // const vx = particle.vx * canvasWidth * 10;
  // const vy = particle.vy * canvasHeight * 10;
  // ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  // ctx.lineWidth = 2;
  // ctx.beginPath();
  // ctx.moveTo(x, y);
  // ctx.lineTo(x + vx, y + vy);
  // ctx.stroke();
}

function drawTrails(
  ctx: CanvasRenderingContext2D,
  field: ParticleField,
  canvasWidth: number,
  canvasHeight: number,
  trails: Map<string, Array<{ x: number; y: number }>>
): void {
  for (const particle of field) {
    const trail = trails.get(particle.id);
    if (!trail || trail.length < 2) continue;

    const color = getParticleColor(particle);
    
    ctx.strokeStyle = `${color}40`;
    ctx.lineWidth = particle.radius * canvasWidth * 0.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    const first = trail[0];
    ctx.moveTo(first.x * canvasWidth, first.y * canvasHeight);

    for (let i = 1; i < trail.length; i++) {
      const point = trail[i];
      ctx.lineTo(point.x * canvasWidth, point.y * canvasHeight);
    }

    ctx.stroke();
  }
}

function updateTrails(
  field: ParticleField,
  trails: Map<string, Array<{ x: number; y: number }>>
): void {
  const maxTrailLength = 10;

  // Add current positions to trails
  for (const particle of field) {
    if (!trails.has(particle.id)) {
      trails.set(particle.id, []);
    }

    const trail = trails.get(particle.id)!;
    trail.push({ x: particle.x, y: particle.y });

    // Limit trail length
    if (trail.length > maxTrailLength) {
      trail.shift();
    }
  }

  // Remove trails for particles that no longer exist
  const activeIds = new Set(field.map((p) => p.id));
  for (const id of trails.keys()) {
    if (!activeIds.has(id)) {
      trails.delete(id);
    }
  }
}

function getParticleColor(particle: Particle): string {
  switch (particle.state) {
    case "alive":
      return palette.alive;
    case "dormant":
      return palette.dormant;
    case "blight":
      return palette.blight;
    case "catalyst":
      return palette.catalyst;
    default:
      return palette.empty;
  }
}

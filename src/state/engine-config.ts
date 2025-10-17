import type { DifficultyConfig, EngineConfig } from "./types";
import type { FeatureFlags } from "../../config/feature-flags";
import type { LifeTickOptions } from "../engine/lifecycle/life-tick";
import type { DormancyConfig } from "../engine/lifecycle/dormancy";
import type { IsolationDecayConfig } from "../engine/lifecycle/decay";
import type { BlightSpawnConfig, CatalystSpawnConfig } from "../engine/hazards/spawn";

/**
 * Converts difficulty config and feature flags into engine-ready configuration
 */
export function buildEngineConfig(
  difficulty: DifficultyConfig,
  flags: FeatureFlags
): EngineConfig {
  // Life tick options
  const lifeOptions: LifeTickOptions = {
    birthNeighbors: difficulty.birthRule === "2-3" ? [2, 3] : [3],
    survivalNeighbors: [2, 3] // Standard Conway survival
  };

  // Dormancy config (always enabled for E=1 cells)
  const dormancyConfig: DormancyConfig = {
    threshold: 3 // noMergeTicks threshold
  };

  // Decay config (isolation decay)
  const decayConfig: IsolationDecayConfig | undefined =
    flags.decay && difficulty.decay === "on"
      ? {
          amount: 1, // -1 E per isolated cell
          minimumEnergy: 1 // Floor at E=1
        }
      : undefined;

  // Blight spawn config
  const blightConfig: BlightSpawnConfig | undefined =
    flags.blight && difficulty.blight !== "off"
      ? {
          spawnChance: getBlightSpawnChance(difficulty.blight),
          linger: difficulty.blight === "medium" || difficulty.blight === "high" ? 2 : 1,
          maxTokens: 3
        }
      : undefined;

  // Catalyst spawn config
  const catalystConfig: CatalystSpawnConfig | undefined = flags.catalysts
    ? {
        spawnChance: getCatalystSpawnChance(difficulty.catalystRate),
        maxCount: 2
      }
    : undefined;

  return {
    lifeOptions,
    dormancyConfig,
    decayConfig,
    blightConfig,
    catalystConfig,
    eCap: difficulty.eCap
  };
}

/**
 * Maps blight difficulty level to spawn probability
 */
function getBlightSpawnChance(level: string): number {
  switch (level) {
    case "low":
      return 0.15;
    case "medium":
      return 0.25;
    case "high":
      return 0.35;
    default:
      return 0;
  }
}

/**
 * Maps catalyst rate to spawn probability
 */
function getCatalystSpawnChance(rate: string): number {
  switch (rate) {
    case "low":
      return 0.1;
    case "medium":
      return 0.2;
    case "high":
      return 0.3;
    default:
      return 0;
  }
}

/**
 * Loads difficulty configuration from JSON
 * In production, this would dynamically import the JSON file
 * For now, returns early difficulty as default
 */
export async function loadDifficulty(name: string): Promise<DifficultyConfig> {
  // Dynamic import based on difficulty name
  try {
    const module = await import(`../../config/difficulty/${name}.json`);
    return module.default as DifficultyConfig;
  } catch (error) {
    console.warn(`Failed to load difficulty ${name}, using early`, error);
    // Fallback to early
    return {
      name: "early",
      boardSize: 6,
      eCap: 8,
      birthRule: "2-3",
      blight: "off",
      decay: "off",
      catalystRate: "low",
      stabilizeThreshold: 25
    };
  }
}

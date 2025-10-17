export interface FeatureFlags {
  blight: boolean;
  catalysts: boolean;
  decay: boolean;
  telemetry: boolean;
}

export const defaultFlags: FeatureFlags = {
  blight: false,
  catalysts: true,
  decay: false,
  telemetry: true
};

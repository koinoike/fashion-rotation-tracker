import { SEASONAL_PLACEMENT_OVERRIDES } from "./placementData.js";

export const DEFAULT_PLACEMENT_CONFIG = {
  positions: [
    { x: 17, y: 30, scale: 0.2 },
    { x: 32, y: 15, scale: 0.2 },
    { x: 90, y: 53, scale: 0.2 },
  ],
};

export function getPlacementConfig(season, collectionId) {
  const seasonalOverrides = SEASONAL_PLACEMENT_OVERRIDES[season] || {};
  const overrides = seasonalOverrides[collectionId] || {};

  return {
    positions: overrides.positions || DEFAULT_PLACEMENT_CONFIG.positions,
    outfitScale:
      overrides.positions?.[0]?.scale ??
      DEFAULT_PLACEMENT_CONFIG.positions[0].scale,
  };
}

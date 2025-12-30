// src/constants/seasonConfig.js
import { COLLECTIONS_BY_PODIUM } from "./podiumConfig.js";
import { seasonConfig as seasonConfigData } from "./collectionNumber.js";

export const MANUAL_SEASON = "winter";
export const seasonConfig = seasonConfigData;

export const BLUR_SEASONS = {
  winter: false,
  spring: false,
  summer: true,
  autumn: true,
};

// ============================================================================
// FUNCTIONS
// ============================================================================
export const hasIndependentPodiums = (season) => {
  return COLLECTIONS_BY_PODIUM[season] !== undefined;
};

export const getTotalCollections = (season) => {
  return seasonConfig[season]?.totalCollections || 0;
};

export const getCutPodiumConfig = (season) => {
  const podiums = COLLECTIONS_BY_PODIUM[season];
  if (!podiums) return null;

  const total = getTotalCollections(season);

  return {
    left: podiums.left.slice(0, total),
    center: podiums.center.slice(0, total),
    right: podiums.right.slice(0, total),
  };
};

export const getLayersPerCollection = (season) =>
  seasonConfig[season]?.layersPerCollection || 3;

/**
 * Получить пути к нарядам для текущего слота времени
 * @param {string} season
 * @param {number} timeIndex - индекс времени (0, 1, 2, ...)
 * @returns {Array<string>} - массив путей [left, center, right]
 */
export const getOutfitPathsForSlot = (season, timeIndex) => {
  const podiums = getCutPodiumConfig(season);
  // Fallback: no independent podiums
  if (!podiums || !hasIndependentPodiums(season)) {
    const collectionId = timeIndex + 1;
    return [1, 2, 3].map(
      (i) => `/assets/transparent/${season}/${collectionId}_${i}.png`
    );
  }

  // Получаем ID нарядов для каждого подиума
  const leftId = podiums.left[timeIndex % podiums.left.length];
  const centerId = podiums.center[timeIndex % podiums.center.length];
  const rightId = podiums.right[timeIndex % podiums.right.length];

  return [
    `/assets/transparent/${season}/${leftId}.png`,
    `/assets/transparent/${season}/${centerId}.png`,
    `/assets/transparent/${season}/${rightId}.png`,
  ];
};

export const getNewCollections = (season) => {
  return seasonConfig[season]?.newCollections || [];
};

export const isNewCollection = (season, collectionId) => {
  const newCollections = getNewCollections(season);
  return newCollections.includes(collectionId);
};

/**
 * Получить ID наряда для конкретного подиума в конкретный момент времени
 * @param {string} season
 * @param {number} podiumIndex - 0=left, 1=center, 2=right
 * @param {number} timeIndex - индекс времени
 * @returns {number} - ID наряда из JSON
 */
export const getOutfitIdForPodium = (season, podiumIndex, timeIndex) => {
  const podiums = getCutPodiumConfig(season);

  if (!podiums || !hasIndependentPodiums(season)) {
    // Fallback: calculate ID based on old logic
    const collectionId = timeIndex + 1;
    return (collectionId - 1) * 3 + podiumIndex + 1;
  }

  const podiumKeys = ["left", "center", "right"];
  const podiumKey = podiumKeys[podiumIndex];
  const ids = podiums[podiumKey];

  return ids[timeIndex % ids.length];
};

/**
 * Получить ID коллекции для подиума (для обратной совместимости)
 * @param {string} season
 * @param {number} podiumIndex - 0=left, 1=center, 2=right
 * @param {number} timeIndex
 * @returns {number} - ID коллекции
 */
export const getCollectionForPodium = (season, podiumIndex, timeIndex) => {
  const outfitId = getOutfitIdForPodium(season, podiumIndex, timeIndex);
  // Convert outfit ID to collection ID: ID 1-3 → collection 1, ID 4-6 → collection 2
  return Math.ceil(outfitId / 3);
};

export const generateOutfitPaths = (season, collectionId) =>
  [1, 2, 3].map(
    (i) => `/assets/transparent/${season}/${collectionId}_${i}.png`
  );

export const generateOutfitPathsWithIndependentPodiums = (season, timeIndex) =>
  getOutfitPathsForSlot(season, timeIndex);

export const getCollectionOrder = (season) => {
  const total = getTotalCollections(season);
  return Array.from({ length: total }, (_, i) => i + 1);
};

export const collectionExists = (season, collectionId) => {
  return collectionId >= 1 && collectionId <= getTotalCollections(season);
};

// Legacy exports
export const COLLECTION_ORDER = {};
export const PODIUM_COLLECTIONS = {};
export const PODIUM_FILES = {}; // Kept for compatibility

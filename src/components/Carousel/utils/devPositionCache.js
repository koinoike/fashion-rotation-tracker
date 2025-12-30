/**
 * Global cache for dev mode positions across all collections/seasons
 * Structure: { "winter_1": { positions: [...], scales: {...} } }
 */
class DevPositionCache {
  constructor() {
    this.cache = {};
    this.dirtyCollections = new Set();
  }

  /**
   * Generate cache key from season and collection ID
   */
  getCacheKey(season, collectionId) {
    return `${season}_${collectionId}`;
  }

  /**
   * Check if collection has cached data
   */
  has(season, collectionId) {
    const key = this.getCacheKey(season, collectionId);
    return !!this.cache[key];
  }

  /**
   * Get cached positions and scales
   */
  get(season, collectionId) {
    const key = this.getCacheKey(season, collectionId);
    const cached = this.cache[key];

    if (!cached) return null;

    return {
      positions: [...cached.positions], // Clone to prevent mutations
      scales: { ...cached.scales },
    };
  }

  /**
   * Save positions and scales to cache
   */
  set(season, collectionId, positions, scales) {
    const key = this.getCacheKey(season, collectionId);

    this.cache[key] = {
      positions: [...positions], // Clone when caching
      scales: { ...scales },
    };

    console.log(`💾 Cached ${key}:`, this.cache[key]);
  }

  /**
   * Mark collection as modified
   */
  markDirty(season, collectionId) {
    const key = this.getCacheKey(season, collectionId);
    this.dirtyCollections.add(key);
  }

  /**
   * Get all dirty (modified) collections
   */
  getDirtyCollections() {
    return Array.from(this.dirtyCollections);
  }

  /**
   * Clear dirty flags (after successful save)
   */
  clearDirty() {
    this.dirtyCollections.clear();
  }

  /**
   * Get total number of cached collections
   */
  size() {
    return Object.keys(this.cache).length;
  }

  /**
   * Get number of modified collections
   */
  dirtyCount() {
    return this.dirtyCollections.size;
  }

  /**
   * Get cache data for saving to API
   */
  getDataForSave() {
    const dirtyKeys = this.getDirtyCollections();

    // Group by season
    const bySeason = {};
    dirtyKeys.forEach((key) => {
      const [season, collectionId] = key.split("_");
      if (!bySeason[season]) bySeason[season] = {};
      bySeason[season][collectionId] = this.cache[key];
    });

    return bySeason;
  }
}

// Singleton instance
export const devCache = new DevPositionCache();

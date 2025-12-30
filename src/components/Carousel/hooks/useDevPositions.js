import { useState, useEffect, useRef, useMemo } from "react";
import { devCache } from "../utils/devPositionCache";
import { outfitService } from "../../../domain/outfit/outfitService";

export function useDevPositions(
  seasonData,
  item,
  outfits,
  devMode,
  imageDimensions
) {
  // ✅ stable memoization to satisfy the compiler
  const cacheKey = useMemo(() => {
    if (!item?.id || !seasonData?.path) return null;
    return devCache.getCacheKey(seasonData.path, item.id);
  }, [item, seasonData]);

  const [positions, setPositions] = useState([]);
  const positionsRef = useRef([]);

  // ✅ Initialize data outside of the render path
  useEffect(() => {
    if (!cacheKey || !outfits || outfits.length === 0) return;

    let initialPositions = [];

    if (devCache.has(seasonData.path, item.id)) {
      initialPositions = devCache.get(seasonData.path, item.id).positions;
    } else {
      const isMobileInit =
        imageDimensions.width > 0 && imageDimensions.width < 640;
      const placement = outfitService.getPlacementForCollection(
        seasonData.path,
        item.id
      );

      initialPositions = outfits.map((outfit, index) => {
        const savedPos = placement?.positions?.[index];
        if (savedPos && savedPos.scale !== undefined) {
          return { x: savedPos.x, y: savedPos.y, scale: savedPos.scale };
        }
        const display = devMode
          ? outfitService.getOutfitDisplayDev(outfit, isMobileInit)
          : outfitService.getOutfitDisplay(outfit, isMobileInit);

        return {
          x: display.position.x,
          y: display.position.y,
          scale: display.scale ?? 0.2,
        };
      });
    }

    setPositions(initialPositions);
    positionsRef.current = initialPositions;
  }, [cacheKey, outfits?.length, devMode, imageDimensions.width]);

  const syncToCache = (newPositions) => {
    const scales = {};
    outfits.forEach((o, i) => {
      if (newPositions[i]) scales[o.outfitId] = newPositions[i].scale;
    });

    devCache.set(seasonData.path, item.id, newPositions, scales);
    devCache.markDirty(seasonData.path, item.id);
  };

  const updatePosition = (index, x, y) => {
    const next = [...positionsRef.current];
    if (!next[index]) return next;

    next[index] = {
      ...next[index],
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    };

    positionsRef.current = next;
    setPositions(next);
    syncToCache(next);
    return next;
  };

  const updateScale = (index, scale) => {
    const next = [...positionsRef.current];
    if (!next[index]) return next;

    next[index] = {
      ...next[index],
      scale: Number(parseFloat(scale).toFixed(3)),
    };

    positionsRef.current = next;
    setPositions(next);
    syncToCache(next);
    return next;
  };

  const getPosition = (index) => positions[index] || { x: 0, y: 0, scale: 0.2 };

  return {
    positions,
    positionsRef,
    updatePosition,
    updateScale,
    getPosition,
  };
}

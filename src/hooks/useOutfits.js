import { useMemo } from "react";
import { outfitService } from "../domain/outfit/outfitService";
import { useSeason } from "../contexts/SeasonContext";

/**
 * Хук для получения нарядов коллекции
 * Автоматически работает с обычными и независимыми подиумами
 */
export function useOutfits(pricesData, collectionId, timeIndex = null) {
  const { seasonData } = useSeason();

  // console.log("🔧 useOutfits called with:", {
  //   pricesData,
  //   collectionId,
  //   timeIndex,
  //   season: seasonData.path,
  // });

  return useMemo(() => {
    if (!pricesData || !collectionId) {
      console.warn("⚠️ useOutfits: missing pricesData or collectionId", {
        hasPricesData: !!pricesData,
        collectionId,
      });
      return [];
    }

    try {
      // console.log("🔧 useOutfits: calling outfitService.getOutfits");

      const result = outfitService.getOutfits(
        pricesData,
        seasonData.path,
        collectionId,
        timeIndex
      );

      // console.log("✅ useOutfits: result", result);
      return result;
    } catch (error) {
      // console.error("❌ useOutfits error:", error);
      return [];
    }
  }, [pricesData, seasonData.path, collectionId, timeIndex]);
}

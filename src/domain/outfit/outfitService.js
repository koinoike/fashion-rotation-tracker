import { Outfit } from "./OutfitModel";
import { rumbToRub } from "../../utils/rumbCalc";
import {
  hasIndependentPodiums,
  getCollectionForPodium,
  getOutfitIdForPodium,
} from "../../constants/seasonConfig";
import { getPlacementConfig } from "../../constants/placementConfig";
import {
  getPricesForCollection,
  getOutfitById,
} from "../../utils/pricesLoader";

export const outfitService = {
  getOutfitsForCollection(pricesData, season, collectionId) {
    const collectionData = pricesData[collectionId];
    if (!collectionData) return [];
    return Outfit.fromCollectionData(collectionData, collectionId, season);
  },

  getOutfitsForTimeIndex(pricesData, season, timeIndex) {
    const outfits = [];

    // For each podium (left=0, center=1, right=2)
    for (let podiumIndex = 0; podiumIndex < 3; podiumIndex++) {
      // Get which outfit ID this podium should show at this timeIndex
      const outfitId = getOutfitIdForPodium(season, podiumIndex, timeIndex);

      // Get outfit data by ID directly from flat JSON
      const outfitData = getOutfitById(season, outfitId);

      // if (!outfitData) {
      //   console.warn(
      //     `No data for outfit ID ${outfitId} at podium ${podiumIndex}`
      //   );
      //   continue;
      // }

      // Calculate which collection this belongs to
      const actualCollectionId = getCollectionForPodium(
        season,
        podiumIndex,
        timeIndex
      );

      const outfit = Outfit.fromIndependentPodium(
        { ...outfitData, outfitId }, // Add outfitId to the data
        timeIndex,
        podiumIndex,
        season,
        actualCollectionId
      );
      outfits.push(outfit);
    }

    return outfits;
  },

  getOutfits(pricesData, season, collectionId, timeIndex = null) {
    if (hasIndependentPodiums(season) && timeIndex !== null) {
      return this.getOutfitsForTimeIndex(pricesData, season, timeIndex);
    }
    return this.getOutfitsForCollection(pricesData, season, collectionId);
  },

  getPlacementForCollection(season, collectionId) {
    return getPlacementConfig(season, collectionId);
  },

  getOutfitDisplay(outfit, isMobile = false) {
    const placement = this.getPlacementForCollection(
      outfit.season,
      outfit.collectionId
    );
    const position = placement.positions[outfit.podiumIndex];
    const baseScale =
      placement.outfitScaleByIndex?.[outfit.podiumIndex] ??
      placement.outfitScale;
    const MOBILE_MULTIPLIER = 1.15;
    const finalScale = isMobile ? baseScale * MOBILE_MULTIPLIER : baseScale;

    return {
      src: outfit.getTransparentImage(),
      position,
      scale: finalScale,
      zIndex: 10 - outfit.podiumIndex,
    };
  },

  /**
   * Dev-only outfit display: keeps scale as decimal, logs all values
   */
  getOutfitDisplayDev(outfit, isMobile = false) {
    // console.log(
    //   `[DEV INPUT] Outfit ${outfit.outfitId} podium ${outfit.podiumIndex}`,
    //   outfit
    // );
    const placement = this.getPlacementForCollection(
      outfit.season,
      outfit.collectionId
    );

    // position object from placement (x/y)
    const pos = placement.positions?.[outfit.podiumIndex] || { x: 0, y: 0 };

    // only use default 0.2 if there is literally no placement scale anywhere
    const baseScale =
      placement.outfitScaleByIndex?.[outfit.podiumIndex] ??
      placement.outfitScale ??
      0.2;

    // If the saved dev position has a scale, use it instead
    const finalScale =
      outfit.devScale ?? (isMobile ? baseScale * 1.15 : baseScale);

    // console.log(
    //   `[DEV] Outfit ${outfit.outfitId} podium ${outfit.podiumIndex}:`,
    //   {
    //     position: pos,
    //     baseScale,
    //     finalScale,
    //   }
    // );

    return {
      src: outfit.getTransparentImage(),
      position: pos,
      scale: finalScale,
      zIndex: 10 - outfit.podiumIndex,
    };
  },

  calculateTotal(outfits) {
    return outfits.reduce(
      (acc, outfit) => {
        const price = parseInt(outfit.price, 10);
        if (outfit.currency === "coins") acc.coins += price;
        else if (outfit.currency === "rumb") acc.rumb += price;
        return acc;
      },
      { coins: 0, rumb: 0 }
    );
  },

  convertRumbToRubles(rumbAmount) {
    const { min, max } = rumbToRub(rumbAmount);
    return { min, max, formatted: `${min.toFixed(0)} – ${max.toFixed(0)} ₽` };
  },

  getSeasonStats(pricesData, season) {
    const allOutfits = [];
    Object.keys(pricesData).forEach((collectionId) => {
      const outfits = this.getOutfitsForCollection(
        pricesData,
        season,
        collectionId
      );
      allOutfits.push(...outfits);
    });

    const totals = this.calculateTotal(allOutfits);
    const rubConversion = this.convertRumbToRubles(totals.rumb);

    return {
      totalOutfits: allOutfits.length,
      totalCollections: Object.keys(pricesData).length,
      totalCoins: totals.coins,
      totalRumb: totals.rumb,
      totalRubles: rubConversion,
    };
  },

  generateFilename(outfit) {
    const date = outfit.formattedDate || "unknown";
    const sanitized = outfit.setName
      .replace(/[^а-яА-Яa-zA-Z0-9]/g, "_")
      .substring(0, 30);
    return `${outfit.season}_${sanitized}_${date}.png`;
  },
};

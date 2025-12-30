import { useMemo } from "react";
import { getNext3Times } from "../../../../utils/timeUtils";

export function useOutfitTimes(outfits, tz, totalCollections) {
  return useMemo(() => {
    const map = {};
    outfits.forEach((item) => {
      map[item.key] = getNext3Times(
        Number(item.collectionId),
        tz,
        totalCollections
      );
    });
    return map;
  }, [outfits, tz, totalCollections]);
}

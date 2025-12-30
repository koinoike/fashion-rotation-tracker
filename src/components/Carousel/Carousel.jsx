import React, { useState, useEffect } from "react";
import { useSeason } from "../../contexts/SeasonContext";
import { getPricesForCollection } from "../../utils/pricesLoader";
import { useOutfits } from "../../hooks/useOutfits";
import {
  MANUAL_SEASON,
  BLUR_SEASONS,
  hasIndependentPodiums,
  getNewCollections,
} from "../../constants/seasonConfig";
import CarouselControls from "./CarouselControls";
import CarouselImage from "./CarouselImage";
import Indicators from "./Indicators";
import PriceOverlay from "../PriceOverlay/PriceOverlay";
import "./Carousel.css";

const SEASON_NAMES = {
  winter: "зимы ❄️",
  spring: "весны 🌸",
  summer: "лета ☀️",
  autumn: "осени 🍂",
};

export default function Carousel({
  items,
  currentIndex,
  liveIndex,
  onPrev,
  onNext,
  onSelect,
  countdown,
  onItemSelect,
  showUpdateNotification = false,
  devMode = true,
}) {
  const [ready, setReady] = useState(false);
  const { seasonData } = useSeason();

  useEffect(() => {
    if (currentIndex > items.length) {
      onSelect(1);
    }
  }, [items, currentIndex, onSelect]);

  const safeIndex = Math.min(Math.max(currentIndex, 1), items.length);
  const item = items[safeIndex - 1];

  const isActiveSeason =
    seasonData.id === MANUAL_SEASON && !showUpdateNotification;

  const shouldBlur = BLUR_SEASONS[seasonData.id] ?? false;

  const liveBadgeIndex = isActiveSeason ? liveIndex : null;

  // NEW: Get new collection indexes and check if current is new
  const newIndexes = getNewCollections(seasonData.path);
  const isNew = newIndexes.includes(safeIndex);

  // FIXED: Disable countdown in dev mode to prevent re-renders
  const countdownDisplay = devMode ? null : isActiveSeason ? countdown : null;

  const inactiveMessage = showUpdateNotification
    ? null
    : !isActiveSeason
    ? `Дождитесь ${SEASON_NAMES[seasonData.id] || "нового времени года"}`
    : null;

  const pricesWithId = getPricesForCollection(seasonData.path, item.id);

  const hasIndependent = hasIndependentPodiums(seasonData.path);
  const timeIndex = hasIndependent ? safeIndex - 1 : null;

  const outfits = useOutfits(pricesWithId, item.id, timeIndex);

  useEffect(() => {
    setReady(false);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [seasonData.id]);

  return (
    <div
      className={`carousel-wrapper ${shouldBlur ? "inactive-season" : ""} ${
        ready ? "ready" : ""
      }`}
    >
      <div className="carousel-image-container">
        <CarouselControls
          onPrev={onPrev}
          onNext={onNext}
          isActiveSeason={isActiveSeason}
        >
          <CarouselImage
            item={item}
            isLive={isActiveSeason && currentIndex === liveBadgeIndex}
            isNew={isNew}
            countdown={countdownDisplay}
            inactiveMessage={inactiveMessage}
            isInactive={shouldBlur}
            shouldBlur={shouldBlur}
            outfits={outfits}
            devMode={devMode}
          >
            <PriceOverlay outfits={outfits} onItemSelect={onItemSelect} />
          </CarouselImage>
        </CarouselControls>

        <div className="indicators-overlay">
          <Indicators
            items={items}
            currentIndex={currentIndex}
            liveIndex={liveBadgeIndex}
            newIndexes={newIndexes}
            onSelect={onSelect}
          />
        </div>
      </div>

      <div className="indicators-below">
        <Indicators
          items={items}
          currentIndex={currentIndex}
          liveIndex={liveBadgeIndex}
          newIndexes={newIndexes}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

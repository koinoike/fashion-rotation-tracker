import React, { useState, useLayoutEffect, useMemo } from "react";
import { SeasonProvider, useSeason } from "./contexts/SeasonContext";
import { useSeasonTheme } from "./hooks/useSeasonTheme";
import Header from "./components/Header/Header";
import Carousel from "./components/Carousel/Carousel";
import ItemDetail from "./components/ItemDetail/ItemDetail";
import Calculator from "./components/Calculator/Calculator";
import Footer from "./components/Footer/Footer";
import { useCollectionTimer } from "./hooks/useCollectionTimer";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { getSeasonItems, TZ_LIST, INTERVAL } from "./constants/config";
import {
  getTotalCollections,
  hasIndependentPodiums,
  getCollectionOrder,
  MANUAL_SEASON,
} from "./constants/seasonConfig";
import "./styles/global.css";
import "./styles/spacing.css";
import "./App.css";
import {
  getPricesForSeason,
  getPricesForCollection,
} from "./utils/pricesLoader";
import { Outfit } from "./domain/outfit/OutfitModel";
import { useOutfits } from "./hooks/useOutfits";
import CatalogOverview from "./components/CatalogOverview/CatalogOverview";
import UpdateNotification from "./components/UpdateNotification/UpdateNotification";
import OutfitCRUD from "./components/OutfitCRUD/OutfitCrud";

function AppContent() {
  const [tz, setTz] = useState("Europe/Moscow");
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const { currentSeason, seasonData } = useSeason();
  const [devInterval, setDevInterval] = useState(INTERVAL);

  // Dev panel states
  const [showCRUD, setShowCRUD] = useState(false);

  const SHOW_UPDATE_NOTIFICATION = false;
  const ENABLE_LIVE_FEATURES = true;

  /*
  ENABLE_DEV_PANEL will be true only when:
	1.	Running local dev (import.meta.env.DEV === true)
	2.	.env.local has VITE_ENABLE_DEV_PANEL=true
  */
  const ENABLE_DEV_PANEL =
    import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_PANEL === "true";

  // devMode state to allow turning it off temporarily
  const [devMode, setDevMode] = useState(ENABLE_DEV_PANEL);

  const [showUpdateNotification, setShowUpdateNotification] = useState(
    SHOW_UPDATE_NOTIFICATION
  );

  const isSeasonTrulyActive =
    seasonData.path === MANUAL_SEASON && ENABLE_LIVE_FEATURES;

  const TOTAL = getTotalCollections(seasonData.path);
  const { liveIndex, countdown } = useCollectionTimer(TOTAL, devMode);

  const currentCollectionId = liveIndex;
  const [index, setIndex] = useState(Math.min(currentCollectionId, TOTAL));
  const [isViewingLive, setIsViewingLive] = useState(true);

  useSeasonTheme();

  useLayoutEffect(() => {
    const validIndex = Math.min(currentCollectionId, TOTAL);
    setIndex(validIndex);
    setIsViewingLive(true);
    setSelectedOutfit(null);
  }, [seasonData.path, currentCollectionId, TOTAL]);

  useLayoutEffect(() => {
    if (isViewingLive) {
      setIndex(Math.min(currentCollectionId, TOTAL));
    }
  }, [currentCollectionId, isViewingLive, TOTAL]);

  const items = useMemo(
    () => getSeasonItems(seasonData.path),
    [seasonData.path]
  );
  useImagePreloader(items);

  const validIndex = Math.max(1, Math.min(index, items.length));
  const currentItem = items[validIndex - 1];
  const currentPricesWithId = currentItem
    ? getPricesForCollection(seasonData.path, currentItem.id)
    : {};

  const currentTimeIndex = hasIndependentPodiums(seasonData.path)
    ? validIndex - 1
    : null;
  const currentOutfits = currentItem
    ? useOutfits(currentPricesWithId, currentItem.id, currentTimeIndex)
    : [];

  const seasonPrices = getPricesForSeason(seasonData.path);
  const allSeasonOutfits = useMemo(() => {
    const outfits = [];
    Object.keys(seasonPrices).forEach((collectionId) => {
      const collectionData = seasonPrices[collectionId];
      if (Array.isArray(collectionData)) {
        const collectionOutfits = Outfit.fromCollectionData(
          collectionData,
          collectionId,
          seasonData.path
        );
        outfits.push(...collectionOutfits);
      }
    });
    return outfits;
  }, [seasonPrices, seasonData.path]);

  const prev = () => {
    setIndex((i) => (i === 1 ? TOTAL : i - 1));
    setIsViewingLive(false);
  };

  const next = () => {
    setIndex((i) => (i === TOTAL ? 1 : i + 1));
    setIsViewingLive(false);
  };

  const goToLive = () => {
    setIndex(currentCollectionId);
    setIsViewingLive(true);
  };

  const handleIndicatorSelect = (idx) => {
    setIndex(idx);
    setIsViewingLive(idx === currentCollectionId);
  };

  const currentTime = new Intl.DateTimeFormat("ru-RU", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  const handleCloseNotification = () => setShowUpdateNotification(false);

  return (
    <div className="container">
      <div className="content">
        <Header
          tz={tz}
          setTz={setTz}
          currentTime={currentTime}
          tzList={TZ_LIST}
        />

        <Carousel
          devMode={devMode}
          items={items}
          currentIndex={validIndex}
          liveIndex={currentCollectionId}
          countdown={countdown}
          onPrev={prev}
          onNext={next}
          onSelect={handleIndicatorSelect}
          onItemSelect={setSelectedOutfit}
          showUpdateNotification={!isSeasonTrulyActive}
        />

        <div className="main-layout">
          {(selectedOutfit || isSeasonTrulyActive) && (
            <ItemDetail
              outfit={selectedOutfit}
              showDownload={false}
              standalone={true}
            />
          )}
          {isSeasonTrulyActive && (
            <Calculator
              index={validIndex}
              liveIndex={currentCollectionId}
              tz={tz}
              total={TOTAL}
              onGoToLive={goToLive}
              outfits={currentOutfits}
              season={seasonData.path}
            />
          )}
        </div>

        <CatalogOverview
          index={validIndex}
          setIndex={setIndex}
          interval={devInterval}
          setInterval={setDevInterval}
        />

        <Footer interval={INTERVAL} allOutfits={allSeasonOutfits} />

        <UpdateNotification
          isOpen={showUpdateNotification}
          onClose={handleCloseNotification}
        />
      </div>

      {devMode && (
        <>
          {/* CRUD Button */}
          <button
            onClick={() => setShowCRUD(true)}
            className="dev-panel-toggle-button"
            style={{ bottom: "216px", zIndex: 9999 }}
          >
            📋 CRUD
          </button>

          {/* Disable Dev Mode Button */}
          <button
            onClick={() => setDevMode(false)}
            className="dev-panel-toggle-button"
            style={{ bottom: "288px", zIndex: 9999 }}
          >
            ❌ Disable Dev Mode
          </button>
        </>
      )}
      {showCRUD && <OutfitCRUD onClose={() => setShowCRUD(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <SeasonProvider>
      <AppContent />
    </SeasonProvider>
  );
}

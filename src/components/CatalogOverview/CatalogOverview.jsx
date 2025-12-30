import React, { useMemo, useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useSeason } from "../../contexts/SeasonContext.jsx";
import { getPricesForSeason } from "../../utils/pricesLoader.js";
import { Outfit } from "../../domain/outfit/OutfitModel.js";
import {
  getTotalCollections,
  MANUAL_SEASON,
} from "../../constants/seasonConfig.js";
import { rumbToRub } from "../../utils/rumbCalc.js";
import { ControlPanel } from "./components/ControlPanel.jsx";
import { OutfitCard } from "./components/OutfitCard.jsx";
import { OutfitTable } from "./components/OutitTable/OutfitTable.jsx";
import { SelectedList } from "./components/SelectedList.jsx";
import "./CatalogOverview.css";
import "./SearchInput.css";
import { getCutPodiumConfig } from "../../constants/seasonConfig.js";

const DEV_MODE = true;

export default function CatalogOverview({ tz: tzFromParent }) {
  const { seasonData } = useSeason();

  // active season logic
  const isActiveSeason = seasonData.path === MANUAL_SEASON;

  const [selected, setSelected] = useState({});
  const [showSelectedList, setShowSelectedList] = useState(false);
  const [viewMode, setViewMode] = useState("carousel");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [filterMode, setFilterMode] = useState("dim");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectMode, setSelectMode] = useState("none");
  const [isSelectDropdownOpen, setIsSelectDropdownOpen] = useState(false);
  const [currencyFilter, setCurrencyFilter] = useState("both");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tz = tzFromParent || "Europe/Berlin";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterDropdownOpen && !event.target.closest(".filter-dropdown")) {
        setIsFilterDropdownOpen(false);
      }
      if (
        isSelectDropdownOpen &&
        !event.target.closest(".select-all-dropdown")
      ) {
        setIsSelectDropdownOpen(false);
      }
      if (
        isCurrencyDropdownOpen &&
        !event.target.closest(".currency-filter-dropdown")
      ) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterDropdownOpen, isSelectDropdownOpen, isCurrencyDropdownOpen]);

  useEffect(() => {
    setSelected({});
    setShowSelectedList(false);
    setSearchQuery("");
  }, [seasonData.path]);

  if (!DEV_MODE) return null;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      containScroll: false,
      align: "start",
    },
    []
  );

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi, onScroll]);

  // ✅ Store actual Outfit instances
  const outfits = useMemo(() => {
    const all = [];
    const pricesData = getPricesForSeason(seasonData.path);
    const totalCollections = getTotalCollections(seasonData.path);
    const podiums = getCutPodiumConfig(seasonData.path);

    // fallback (old seasons)
    if (!podiums) {
      Object.keys(pricesData).forEach((outfitId) => {
        const collectionId = Math.ceil(outfitId / 3);
        if (collectionId > totalCollections) return;

        const podiumIndex = (outfitId - 1) % 3;
        const outfitData = pricesData[outfitId];
        if (!outfitData) return;

        const outfit = new Outfit(outfitData, {
          collectionId,
          podiumIndex,
          season: seasonData.path,
          outfitId: Number(outfitId),
        });

        // Add key property for selection tracking
        outfit.key = `${collectionId}_${podiumIndex}`;
        all.push(outfit);
      });

      return all;
    }

    // ✅ CORRECT ORDER: by timeIndex → podium
    for (let timeIndex = 0; timeIndex < totalCollections; timeIndex++) {
      const ids = [
        podiums.left[timeIndex],
        podiums.center[timeIndex],
        podiums.right[timeIndex],
      ];

      ids.forEach((outfitId, podiumIndex) => {
        const outfitData = pricesData[outfitId];
        if (!outfitData) return;

        const outfit = new Outfit(outfitData, {
          collectionId: timeIndex + 1,
          podiumIndex,
          season: seasonData.path,
          outfitId,
        });

        // Add key property for selection tracking
        outfit.key = `${timeIndex + 1}_${podiumIndex}`;
        all.push(outfit);
      });
    }

    return all;
  }, [seasonData.path]);

  // ✅ Create lightweight objects for carousel/gallery rendering
  const outfitCards = useMemo(() => {
    return outfits.map((outfit) => ({
      key: outfit.key,
      label: outfit.nr,
      realName: outfit.setName,
      price: outfit.price,
      currency: outfit.currency,
      src: outfit.getTransparentImage(),
      collectionId: outfit.collectionId,
    }));
  }, [outfits]);

  const filteredOutfits = useMemo(() => {
    let filtered = outfits;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((outfit) => {
        const labelMatch = outfit.nr?.toLowerCase().includes(query);
        const nameMatch = outfit.setName?.toLowerCase().includes(query);
        return labelMatch || nameMatch;
      });
    }

    // Apply currency filter
    if (currencyFilter !== "both") {
      filtered = filtered.filter(
        (outfit) => outfit.currency === currencyFilter
      );
    }

    // Apply visibility filter
    if (filterMode === "hide") {
      filtered = filtered.filter((outfit) => selected[outfit.key]);
    }

    // console.log("=== Filtered Outfits ===", filtered);
    return filtered;
  }, [outfits, selected, filterMode, currencyFilter, searchQuery]);

  const filteredOutfitCards = useMemo(() => {
    return filteredOutfits.map((outfit) => ({
      key: outfit.key,
      label: outfit.nr,
      realName: outfit.setName,
      price: outfit.price,
      currency: outfit.currency,
      src: outfit.getTransparentImage(),
      collectionId: outfit.collectionId,
    }));
  }, [filteredOutfits]);

  const visibilityFilteredOutfits = useMemo(() => {
    if (filterMode === "hide") {
      return outfits.filter((outfit) => selected[outfit.key]);
    }
    return outfits;
  }, [outfits, selected, filterMode]);

  const hasCoins = useMemo(
    () =>
      visibilityFilteredOutfits.some((outfit) => outfit.currency === "coins"),
    [visibilityFilteredOutfits]
  );

  const hasRumbs = useMemo(
    () =>
      visibilityFilteredOutfits.some((outfit) => outfit.currency === "rumb"),
    [visibilityFilteredOutfits]
  );

  const shouldDim = (key) => {
    return filterMode === "dim" && !selected[key];
  };

  const toggleOutfit = (key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = () => {
    const newSelected = {};
    filteredOutfits.forEach((outfit) => {
      newSelected[outfit.key] = true;
    });
    setSelected(newSelected);
    setSelectMode("all");
  };

  const selectNone = () => {
    setSelected({});
    setSelectMode("none");
  };

  const invertSelection = () => {
    const newSelected = { ...selected };
    filteredOutfits.forEach((outfit) => {
      newSelected[outfit.key] = !selected[outfit.key];
    });
    setSelected(newSelected);
    setSelectMode("invert");
  };

  const totalPrice = useMemo(() => {
    let coins = 0;
    let rumbs = 0;

    visibilityFilteredOutfits.forEach((outfit) => {
      if (!selected[outfit.key]) return;

      if (currencyFilter === "coins" && outfit.currency !== "coins") return;
      if (currencyFilter === "rumb" && outfit.currency !== "rumb") return;

      if (outfit.currency === "coins") coins += Number(outfit.price);
      if (outfit.currency === "rumb") rumbs += Number(outfit.price);
    });

    return { coins, rumbs };
  }, [selected, visibilityFilteredOutfits, currencyFilter]);

  const rubRange = useMemo(() => {
    if (!totalPrice.rumbs) return null;
    const { min, max } = rumbToRub(totalPrice.rumbs);
    return { min: Math.round(min), max: Math.round(max) };
  }, [totalPrice.rumbs]);

  const hasSelectedItems = Object.values(selected).some(Boolean);
  const allSelected =
    filteredOutfits.length > 0 &&
    filteredOutfits.every((outfit) => selected[outfit.key]);

  useEffect(() => {
    if (!hasSelectedItems) {
      setSelectMode("none");
    } else if (allSelected) {
      setSelectMode("all");
    } else {
      setSelectMode("invert");
    }
  }, [hasSelectedItems, allSelected]);

  const cycleViewMode = () => {
    setViewMode((prev) => {
      if (prev === "carousel") return "gallery";
      if (prev === "gallery") return "table";
      return "carousel";
    });
  };

  return (
    <div className="dev-preview">
      <div className="dev-content">
        <ControlPanel
          totalPrice={totalPrice}
          rubRange={rubRange}
          selectMode={selectMode}
          isSelectDropdownOpen={isSelectDropdownOpen}
          setIsSelectDropdownOpen={setIsSelectDropdownOpen}
          selectNone={selectNone}
          selectAll={selectAll}
          invertSelection={invertSelection}
          filterMode={filterMode}
          isFilterDropdownOpen={isFilterDropdownOpen}
          setIsFilterDropdownOpen={setIsFilterDropdownOpen}
          setFilterMode={setFilterMode}
          hasSelectedItems={hasSelectedItems}
          currencyFilter={currencyFilter}
          isCurrencyDropdownOpen={isCurrencyDropdownOpen}
          setIsCurrencyDropdownOpen={setIsCurrencyDropdownOpen}
          setCurrencyFilter={setCurrencyFilter}
          viewMode={viewMode}
          cycleViewMode={cycleViewMode}
          hasCoins={hasCoins}
          hasRumbs={hasRumbs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {viewMode === "table" ? (
          <OutfitTable
            outfits={filteredOutfits}
            selected={selected}
            toggleOutfit={toggleOutfit}
            totalCollections={getTotalCollections(seasonData.path)}
            tz={tz}
            isMobile={isMobile}
            shouldDim={shouldDim}
            isActive={isActiveSeason}
            showTimes={false}
          />
        ) : (
          <>
            <div
              className={`outfit-scroll-container ${
                viewMode === "gallery" ? "gallery-mode" : ""
              }`}
              ref={viewMode === "carousel" ? emblaRef : null}
            >
              <div
                className={`outfit-grid ${
                  viewMode === "gallery" ? "gallery-mode" : ""
                }`}
              >
                {filteredOutfitCards.map((item) => (
                  <OutfitCard
                    key={item.key}
                    item={item}
                    selected={selected}
                    toggleOutfit={toggleOutfit}
                    dimmed={shouldDim(item.key)}
                  />
                ))}
              </div>
            </div>

            {viewMode === "carousel" && (
              <div className="scroll-indicator">
                <div
                  className="scroll-indicator-bar"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            )}
          </>
        )}

        <div className="totals-row">
          <div className="totals-wrapper" />
          {hasSelectedItems && (
            <div className="selected-toggle">
              <button onClick={() => setShowSelectedList((p) => !p)}>
                {showSelectedList ? "Hide selection" : "Show selection"}
              </button>
            </div>
          )}
        </div>

        {showSelectedList && hasSelectedItems && (
          <SelectedList outfits={outfitCards} selected={selected} />
        )}
      </div>
    </div>
  );
}

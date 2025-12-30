import React, { useRef, useState, useEffect } from "react";
import { useSeason } from "../../contexts/SeasonContext";
import { outfitService } from "../../domain/outfit/outfitService";
import { useDevPositions } from "./hooks/useDevPositions.js";
import { useOutfitDrag } from "./hooks/useOutfitDrag.js";
import DevPanel from "./components/DevPanel";
import "./CarouselImage.css";

const MOBILE_SCALE_MULTIPLIER = 1.08;
const USE_DYNAMIC_BACKGROUNDS = true;

// 🎄 New Year background settings
const ENABLE_NEW_YEAR_BACKGROUND = true;
const NEW_YEAR_BACKGROUND_ALWAYS = true; // set to true to show New Year's background all the time

export default function CarouselImage({
  item,
  isLive,
  isNew, // NEW prop
  countdown,
  inactiveMessage,
  shouldBlur,
  outfits = [],
  children,
  devMode = false,
}) {
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [hiddenOutfits, setHiddenOutfits] = useState({});
  const [showOutfits, setShowOutfits] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showOutlines, setShowOutlines] = useState(true);

  const { seasonData } = useSeason();
  const prevSeasonRef = useRef(seasonData.path);
  const prevCollectionRef = useRef(item.id);

  // ✅ Use custom hooks for complex logic
  const { positionsRef, updatePosition, updateScale, getPosition } =
    useDevPositions(seasonData, item, outfits, devMode, imageDimensions);

  const { isDragging, selectedPodium, handleMouseDown } = useOutfitDrag(
    devMode,
    imageRef,
    positionsRef,
    updatePosition
  );

  // Check if we're in New Year period (Dec 25 - Jan 7)
  const isNewYearPeriod = () => {
    if (!ENABLE_NEW_YEAR_BACKGROUND) return false;

    // If always enabled, return true
    if (NEW_YEAR_BACKGROUND_ALWAYS) return true;

    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate(); // 1-31

    // December (month 11) from 25 to 31
    if (month === 11 && day >= 25) {
      return true;
    }

    // January (month 0) from 1 to 7
    if (month === 0 && day <= 7) {
      return true;
    }

    return false;
  };

  // Reset hidden outfits on collection change
  useEffect(() => {
    const seasonChanged = prevSeasonRef.current !== seasonData.path;
    const collectionChanged = prevCollectionRef.current !== item.id;

    prevSeasonRef.current = seasonData.path;
    prevCollectionRef.current = item.id;
    setHiddenOutfits({});

    if (seasonChanged) {
      setShowOutfits(true);
    } else if (collectionChanged) {
      setShowOutfits(false);
      const t = setTimeout(() => setShowOutfits(true), 40);
      return () => clearTimeout(t);
    }
  }, [item.id, seasonData.path]);

  // Update image dimensions
  useEffect(() => {
    const update = () => {
      if (imageRef.current) {
        setImageDimensions({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    imageRef.current?.addEventListener("load", update);
    return () => {
      window.removeEventListener("resize", update);
      imageRef.current?.removeEventListener("load", update);
    };
  }, []);

  const handleOutfitError = (index) =>
    setHiddenOutfits((p) => ({ ...p, [index]: true }));

  const isMobile = imageDimensions.width < 640;

  const getBackgroundImage = () => {
    if (!USE_DYNAMIC_BACKGROUNDS) {
      return "/assets/background/background.png";
    }

    // Check for New Year period for winter season
    if (isNewYearPeriod() && seasonData.path === "winter") {
      return `/assets/background/background_winter_newyear.png`;
    }

    return `/assets/background/background_${seasonData.path}.png`;
  };

  return (
    <div className="image-block">
      <div className={`image-wrapper ${shouldBlur ? "clip-outfits" : ""}`}>
        <img
          ref={imageRef}
          src={getBackgroundImage()}
          alt={item.title}
          className="image"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* Dev Grid Overlay */}
        {devMode && showGrid && imageDimensions.width > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.5)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage: `
                  linear-gradient(rgba(102, 126, 234, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(102, 126, 234, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: "10% 10%",
              }}
            />
          </div>
        )}

        {/* Outfit Overlays */}
        {imageDimensions.width > 0 &&
          outfits.map((outfit, index) => {
            if (hiddenOutfits[index] || !outfit.isValid?.()) return null;

            const display = devMode
              ? outfitService.getOutfitDisplayDev(outfit, isMobile)
              : outfitService.getOutfitDisplay(outfit, isMobile);

            const pos = getPosition(index);
            const scaleForUI =
              pos.scale * (isMobile ? MOBILE_SCALE_MULTIPLIER : 1) * 100;
            const isBeingDragged = devMode && selectedPodium === index;

            return (
              <img
                key={`${outfit.season}-${outfit.collectionId}-${outfit.podiumIndex}`}
                src={display.src}
                alt={outfit.setName}
                onError={() => handleOutfitError(index)}
                className="outfit-overlay"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: `${scaleForUI}%`,
                  transform: "translate(-50%, -50%)",
                  opacity: showOutfits ? 1 : 0,
                  zIndex: isBeingDragged ? 1000 : display.zIndex,
                  cursor: devMode
                    ? isBeingDragged
                      ? "grabbing"
                      : "grab"
                    : "default",
                  pointerEvents: devMode ? "auto" : "none",
                  userSelect: "none",
                  filter: isBeingDragged
                    ? "drop-shadow(0 4px 12px rgba(102, 126, 234, 0.6))"
                    : "none",
                  transition: isBeingDragged
                    ? "none"
                    : "opacity 0.4s ease-in-out",
                  outline:
                    devMode && showOutlines && !isBeingDragged
                      ? "2px dashed rgba(102, 126, 234, 0.5)"
                      : "none",
                  outlineOffset: "4px",
                }}
                onMouseDown={(e) => handleMouseDown(e, index)}
                draggable={false}
              />
            );
          })}

        {shouldBlur && <div className="inactive-overlay" />}
        {imageDimensions.width > 0 &&
          React.cloneElement(children, { imageDimensions })}
      </div>

      {/* Title & Status */}
      <div className="title-block">
        {isLive && <span className="live-badge">LIVE</span>}
        {isNew && <span className="new-badge">NEW</span>}
        {item.title}
      </div>
      {countdown ? (
        <div className="countdown">
          Collection changes in{" "}
          <span className="countdown-time">{countdown}</span>
        </div>
      ) : (
        inactiveMessage && (
          <div className="inactive-message">{inactiveMessage}</div>
        )
      )}

      {/* Dev Panel */}
      {devMode && (
        <>
          <DevPanel
            seasonData={seasonData}
            item={item}
            outfits={outfits}
            positions={positionsRef.current}
            hiddenOutfits={hiddenOutfits}
            isMobile={isMobile}
            onScaleChange={updateScale}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onToggleOutlines={() => setShowOutlines(!showOutlines)}
            showGrid={showGrid}
            showOutlines={showOutlines}
          />

          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              fontSize: "11px",
              color: "#999",
              background: "rgba(0, 0, 0, 0.75)",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #3a3a3a",
              zIndex: 2999,
            }}
          >
            {isDragging
              ? `🖱️ Dragging ${
                  ["left", "center", "right"][selectedPodium]
                } podium`
              : "Click and drag outfits • Drag panel header to move"}
          </div>
        </>
      )}
    </div>
  );
}

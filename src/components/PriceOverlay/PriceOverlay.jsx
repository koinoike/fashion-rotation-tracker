import React, { useState, useRef, useEffect } from "react";
import "./PriceOverlay.css";

// Set which price card to preopen on load: 0 (first), 1 (second), 2 (third), or null (none)
const PREOPEN_CARD_INDEX = 1;

export default function PriceOverlay({ outfits, onItemSelect }) {
  const points = [
    { x: 12, y: 48 },
    { x: 37, y: 37 },
    { x: 95.3, y: 72 },
  ];

  const isMobile = window.innerWidth < 640;
  const isDesktop = window.innerWidth >= 1280;

  // Initialize with selected card open if PREOPEN_CARD_INDEX is set
  const [activeIndex, setActiveIndex] = useState(PREOPEN_CARD_INDEX);
  const [hasInitialized, setHasInitialized] = useState(false);

  // позиции меток относительно точек (в процентах)
  const [labelPositions, setLabelPositions] = useState(
    points.map((point, idx) => {
      if (isDesktop) {
        // DESKTOP spawn positions
        if (idx === 0) {
          return { x: point.x + 27, y: point.y - 5 };
        } else if (idx === 1) {
          return { x: point.x + 12, y: point.y - 12 };
        } else {
          return { x: point.x - 22, y: point.y - 40 };
        }
      } else {
        // MOBILE / TABLET spawn positions (current behavior)
        if (idx === 0) {
          return { x: point.x + 25, y: point.y + 23 };
        } else if (idx === 1) {
          return { x: point.x + 8, y: point.y - 4 };
        } else {
          return { x: point.x - 21, y: point.y - 15 };
        }
      }
    })
  );

  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Configure image placement and visibility for desktop
  // Set to false to disable image for that position
  // If true: position determines left/right placement (true = right, false = left)
  const imageConfig = [
    { enabled: false, right: true },
    { enabled: false, right: true },
    { enabled: false, right: false }, // Position 3: enabled, image on left
  ];

  // Initialize selected card on mount if PREOPEN_CARD_INDEX is set
  useEffect(() => {
    if (
      PREOPEN_CARD_INDEX !== null &&
      !hasInitialized &&
      outfits &&
      outfits.length > 0 &&
      outfits[PREOPEN_CARD_INDEX]
    ) {
      const outfit = outfits[PREOPEN_CARD_INDEX];
      if (outfit.isValid()) {
        onItemSelect(outfit);
        setHasInitialized(true);
      }
    }
  }, [outfits, hasInitialized, onItemSelect]);

  const handleDotClick = (idx) => {
    const newIndex = activeIndex === idx ? null : idx;
    setActiveIndex(newIndex);

    if (newIndex !== null && outfits && outfits[idx]) {
      const outfit = outfits[idx];

      if (outfit.isValid()) {
        onItemSelect(outfit);
      } else {
        onItemSelect(null);
      }
    } else {
      onItemSelect(null);
    }
  };

  const startDrag = (clientX, clientY, idx) => {
    setIsDragging(true);
    setDraggingIndex(idx);
    const rect = containerRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startX: labelPositions[idx].x,
      startY: labelPositions[idx].y,
      containerWidth: rect.width,
      containerHeight: rect.height,
    };
  };

  const handleLabelMouseDown = (e, idx) => {
    e.stopPropagation();
    startDrag(e.clientX, e.clientY, idx);
  };

  const handleLabelTouchStart = (e, idx) => {
    e.stopPropagation();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY, idx);
  };

  const moveDrag = (clientX, clientY) => {
    if (!isDragging || draggingIndex === null) return;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    const deltaXPercent = (deltaX / dragStartRef.current.containerWidth) * 100;
    const deltaYPercent = (deltaY / dragStartRef.current.containerHeight) * 100;

    const newPositions = [...labelPositions];
    newPositions[draggingIndex] = {
      x: Math.max(
        0,
        Math.min(100, dragStartRef.current.startX + deltaXPercent)
      ),
      y: Math.max(
        0,
        Math.min(100, dragStartRef.current.startY + deltaYPercent)
      ),
    };
    setLabelPositions(newPositions);
  };

  const endDrag = () => {
    setIsDragging(false);
    setDraggingIndex(null);
  };

  const handleMouseUp = () => {
    endDrag();
  };

  const handleTouchEnd = () => {
    endDrag();
  };

  React.useEffect(() => {
    if (isDragging) {
      const handleMouseMoveGlobal = (e) => {
        moveDrag(e.clientX, e.clientY);
      };
      const handleTouchMoveGlobal = (e) => {
        if (isDragging) {
          e.preventDefault();
          const touch = e.touches[0];
          moveDrag(touch.clientX, touch.clientY);
        }
      };

      document.addEventListener("mousemove", handleMouseMoveGlobal);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMoveGlobal, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMoveGlobal);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMoveGlobal);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, draggingIndex]);

  if (!outfits || outfits.length === 0) {
    return null;
  }

  return (
    <div
      className="price-overlay"
      ref={containerRef}
      style={{ cursor: isDragging ? "grabbing" : "default" }}
    >
      <svg className="price-lines">
        {points.map((point, idx) => {
          // Only show line when label is active
          if (activeIndex === idx && outfits[idx]) {
            return (
              <line
                key={idx}
                x1={`${point.x}%`}
                y1={`${point.y}%`}
                x2={`${labelPositions[idx].x}%`}
                y2={`${labelPositions[idx].y}%`}
                className="price-line"
              />
            );
          }
          return null;
        })}
      </svg>

      {points.map((point, idx) => {
        const outfit = outfits[idx];
        if (!outfit) return null;

        return (
          <React.Fragment key={idx}>
            {/* Точка */}
            <div
              className="price-dot"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              onClick={() => handleDotClick(idx)}
            />

            {/* Ценник - only show when active */}
            {activeIndex === idx && (
              <div
                className={`price-label ${
                  idx === 2 ? "label-left" : "label-right"
                }`}
                style={{
                  left: `${labelPositions[idx].x}%`,
                  top: `${labelPositions[idx].y}%`,
                }}
              >
                <div
                  className="price-text"
                  onMouseDown={(e) => handleLabelMouseDown(e, idx)}
                  onTouchStart={(e) => handleLabelTouchStart(e, idx)}
                  style={{
                    cursor:
                      isDragging && draggingIndex === idx ? "grabbing" : "grab",
                  }}
                >
                  {/* Image and content wrapper for desktop */}
                  <div
                    className={`price-content-wrapper ${
                      imageConfig[idx].enabled ? "with-image" : ""
                    } ${
                      imageConfig[idx].enabled && imageConfig[idx].right
                        ? "image-right"
                        : ""
                    } ${
                      imageConfig[idx].enabled && !imageConfig[idx].right
                        ? "image-left"
                        : ""
                    }`}
                  >
                    {/* Image - desktop only (1280px+) */}
                    {!isMobile &&
                      imageConfig[idx].enabled &&
                      outfit.collectionId &&
                      window.innerWidth >= 1280 && (
                        <div className="price-image">
                          <img
                            src={outfit.getCloseupImage()}
                            alt={outfit.setName}
                            onError={(e) => {
                              const fallbackSrc = outfit.getFallbackImage();
                              if (e.currentTarget.src !== fallbackSrc) {
                                e.currentTarget.src = fallbackSrc;
                              }
                            }}
                          />
                        </div>
                      )}

                    {/* Text content */}
                    <div className="price-info">
                      {/* Название комплекта */}
                      {outfit.setName && (
                        <div className="set-name">{outfit.setName}</div>
                      )}

                      {/* Цена + валюта */}
                      <div className="price-value">
                        {outfit.displayPrice}{" "}
                        <img
                          src={outfit.currencyIcon}
                          alt={outfit.currency}
                          className="currency-icon"
                        />
                      </div>

                      {/* Список деталей - скрывать на мобильных */}
                      {!isMobile && outfit.hasDetails && (
                        <div className="price-name">
                          {outfit.details.map((line, i) => (
                            <div key={i}>• {line}</div>
                          ))}
                        </div>
                      )}

                      {/* Designer и Date - только десктоп */}
                      {!isMobile && (
                        <>
                          {outfit.designer && (
                            <div className="price-meta">
                              Designer: {outfit.designer}
                            </div>
                          )}
                          {outfit.formattedDate && (
                            <div className="price-meta">
                              Added on: {outfit.formattedDate}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

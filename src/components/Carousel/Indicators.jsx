import React, { useEffect, useRef } from "react";
import "./Indicators.css";

export default function Indicators({
  items,
  currentIndex,
  liveIndex,
  newIndexes = [], // NEW: Array of new collection indexes
  onSelect,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const activeChild = containerRef.current?.children[currentIndex - 1];
    if (activeChild) {
      activeChild.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  return (
    <div className="indicators" ref={containerRef}>
      {items.map((_, i) => {
        const index = i + 1;
        const isLive = index === liveIndex;
        const isNew = newIndexes.includes(index);

        return (
          <button
            key={i}
            onClick={() => onSelect(index)}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
          >
            {/* Live indicator */}
            {isLive && <span className="live-indicator" />}

            {/* New indicator - ALWAYS show when new (CSS will handle merging) */}
            {isNew && <span className="new-indicator" />}
          </button>
        );
      })}
    </div>
  );
}

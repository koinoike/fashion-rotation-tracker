import React, { useEffect, useRef } from "react";
import "./CarouselControls.css";

export default function CarouselControls({
  onPrev,
  onNext,
  children,
  isActiveSeason,
  isNew = false,
}) {
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        onPrev();
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPrev, onNext]);

  // Fix sticky hover on mobile
  useEffect(() => {
    const handleTouchEnd = (e) => {
      // Force blur to remove hover state
      e.currentTarget.blur();
    };

    const prevButton = prevButtonRef.current;
    const nextButton = nextButtonRef.current;

    if (prevButton) {
      prevButton.addEventListener("touchend", handleTouchEnd);
    }
    if (nextButton) {
      nextButton.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (prevButton) {
        prevButton.removeEventListener("touchend", handleTouchEnd);
      }
      if (nextButton) {
        nextButton.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, []);

  return (
    <div className="carousel-controls-wrapper">
      {/* Buttons are now siblings to content, not parents */}
      <button
        ref={prevButtonRef}
        onClick={onPrev}
        className={`carousel-button carousel-button-left ${
          isActiveSeason ? "active-season" : "inactive-season"
        }`}
        data-live={isActiveSeason}
        data-new={isNew}
        aria-label="Previous"
      >
        ◀
      </button>
      <div className="carousel-controls-content">{children}</div>
      <button
        ref={nextButtonRef}
        onClick={onNext}
        className={`carousel-button carousel-button-right ${
          isActiveSeason ? "active-season" : "inactive-season"
        }`}
        data-live={isActiveSeason}
        data-new={isNew}
        aria-label="Next"
      >
        ▶
      </button>
    </div>
  );
}

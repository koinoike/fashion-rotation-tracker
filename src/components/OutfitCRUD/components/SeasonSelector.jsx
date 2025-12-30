// src/components/OutfitCRUD/components/SeasonSelector.jsx - v2 с индикаторами
import React from "react";

const SeasonSelector = ({
  seasons,
  current,
  onChange,
  hasChanges,
  seasonChanges,
}) => {
  return (
    <div className="season-selector">
      {seasons.map((season) => {
        const hasSeasonChanges = seasonChanges?.[season]?.hasChanges;

        return (
          <button
            key={season}
            onClick={() => onChange(season)}
            className={current === season ? "active" : ""}
            style={{
              position: "relative",
            }}
          >
            {season.charAt(0).toUpperCase() + season.slice(1)}

            {/* Индикатор несохранённых изменений */}
            {hasSeasonChanges && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "8px",
                  height: "8px",
                  background: "#f39c12",
                  borderRadius: "50%",
                  border: "2px solid #1a1a1a",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SeasonSelector;

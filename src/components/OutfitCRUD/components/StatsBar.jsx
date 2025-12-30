// src/components/OutfitCRUD/components/StatsBar.jsx - WITH COLLECTION CONFIG
import React, { useEffect, useState } from "react";
import { fetchCollections, fetchOutfits } from "../utils/api";

const StatsBar = ({
  season,
  totalOutfits,
  hasChanges,
  configState,
  setConfigState,
  onConfigChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [originalConfig, setOriginalConfig] = useState(null); // Track original values

  const loadConfig = async () => {
    setLoading(true);
    try {
      const allConfig = await fetchCollections();
      const seasonConfig = allConfig[season] || {
        totalCollections: 0,
        layersPerCollection: 3,
      };
      setConfigState(seasonConfig);
      setOriginalConfig(seasonConfig); // Save original
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [season]);

  const handleChange = (field, value) => {
    const updated = { ...configState, [field]: parseInt(value) || 0 };
    setConfigState(updated);

    // Check if different from original
    if (originalConfig) {
      const hasActualChanges =
        updated.totalCollections !== originalConfig.totalCollections ||
        updated.layersPerCollection !== originalConfig.layersPerCollection;

      // Always call onConfigChange, but pass whether there are actual changes
      onConfigChange?.(hasActualChanges);
    } else {
      onConfigChange?.(true);
    }
  };

  const handleSetMaxCollections = async () => {
    try {
      const outfits = await fetchOutfits(season);
      const totalOutfits = Object.keys(outfits).length;
      const maxCount = Math.ceil(totalOutfits / 3);

      const updated = { ...configState, totalCollections: maxCount };
      setConfigState(updated);

      // Check if different from original
      if (originalConfig) {
        const hasActualChanges = maxCount !== originalConfig.totalCollections;
        onConfigChange?.(hasActualChanges);
      } else {
        onConfigChange?.(true);
      }
    } catch (err) {
      console.error(err);
      alert("Не удалось получить максимальное количество коллекций");
    }
  };

  return (
    <div className="stats-bar">
      {/* Left side: Stats */}
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <div>
          📊 Season: <strong>{season}</strong>
        </div>
        <div>
          👔 Total: <strong>{totalOutfits}</strong>
        </div>
        {hasChanges && (
          <div style={{ color: "#f39c12", fontWeight: "bold" }}>
            ⚠️ Unsaved changes
          </div>
        )}
      </div>

      {/* Right side: Collection Config */}
      {!loading && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <span style={{ fontSize: "12px", color: "#ccc", fontWeight: "500" }}>
            ⚙️ Collections:
          </span>
          <input
            type="number"
            value={configState.totalCollections}
            min={1}
            onChange={(e) => handleChange("totalCollections", e.target.value)}
            style={{
              width: "50px",
              padding: "4px 6px",
              border: "1px solid #3a3a3a",
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "600",
              color: "#fff",
              background: "#1a1a1a",
            }}
            title="Total collections"
          />
          <button
            type="button"
            onClick={handleSetMaxCollections}
            style={{
              padding: "5px 12px",
              border: "none",
              borderRadius: "4px",
              background: "#667eea",
              color: "white",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            title="Set maximum collections"
          >
            Max
          </button>
        </div>
      )}
    </div>
  );
};

export default StatsBar;

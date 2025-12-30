// src/components/OutfitCRUD/components/PlacementEditor.jsx - WITH FIXED DRAGGING
import React, { useState, useEffect, useRef } from "react";
import "./PlacementEditor.css";

const PlacementEditor = ({ season }) => {
  const [placementData, setPlacementData] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedPodium, setSelectedPodium] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);

  // Preview container refs
  const containerRef = useRef(null);
  const backgroundRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Background controls
  const [showBackground, setShowBackground] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5);

  useEffect(() => {
    loadPlacementData();
  }, [season]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [showBackground]);

  const loadPlacementData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/dev/placement/${season}`
      );
      if (response.ok) {
        const data = await response.json();
        setPlacementData(data.placements || {});
        const firstCollection = Object.keys(data.placements || {})[0];
        if (firstCollection) setSelectedCollection(parseInt(firstCollection));
      } else {
        console.error("Failed to load placement data");
        setPlacementData({});
      }
    } catch (err) {
      console.error("Error loading placement data:", err);
      setPlacementData({});
    } finally {
      setLoading(false);
    }
  };

  const handlePositionChange = (podiumIndex, axis, value) => {
    if (!selectedCollection || !placementData[selectedCollection]) return;
    const newData = { ...placementData };
    const collection = newData[selectedCollection];
    if (!collection.positions)
      collection.positions = [
        { x: 17, y: 30 },
        { x: 32, y: 15 },
        { x: 90, y: 53 },
      ];
    collection.positions[podiumIndex] = {
      ...collection.positions[podiumIndex],
      [axis]: parseFloat(value) || 0,
    };
    setPlacementData(newData);
    setHasChanges(true);
  };

  const handleScaleChange = (podiumIndex, value) => {
    if (!selectedCollection || !placementData[selectedCollection]) return;
    const newData = { ...placementData };
    const collection = newData[selectedCollection];
    if (!collection.outfitScaleByIndex) collection.outfitScaleByIndex = {};
    if (value === "" || value === null) {
      delete collection.outfitScaleByIndex[podiumIndex];
    } else {
      collection.outfitScaleByIndex[podiumIndex] = parseFloat(value);
    }
    setPlacementData(newData);
    setHasChanges(true);
  };

  const handleGlobalScaleChange = (value) => {
    if (!selectedCollection || !placementData[selectedCollection]) return;
    const newData = { ...placementData };
    const collection = newData[selectedCollection];
    if (value === "" || value === null) {
      delete collection.outfitScale;
    } else {
      collection.outfitScale = parseFloat(value);
    }
    setPlacementData(newData);
    setHasChanges(true);
  };

  // Dragging handlers
  const handleMouseDown = (e, podiumIndex) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setSelectedPodium(podiumIndex);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || selectedPodium === null || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newXPercent =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const newYPercent =
      ((e.clientY - containerRect.top) / containerRect.height) * 100;

    setPlacementData((prev) => {
      const newData = { ...prev };
      const collection = newData[selectedCollection];
      if (!collection.positions)
        collection.positions = [
          { x: 17, y: 30 },
          { x: 32, y: 15 },
          { x: 90, y: 53 },
        ];
      collection.positions[selectedPodium] = {
        x: Math.max(0, Math.min(100, newXPercent)),
        y: Math.max(0, Math.min(100, newYPercent)),
      };
      return newData;
    });
    setHasChanges(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, selectedPodium, selectedCollection]);

  const savePlacementData = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/dev/placement/${season}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placements: placementData }),
        }
      );

      if (response.ok) {
        alert("✅ Placement data saved!");
        setHasChanges(false);
      } else throw new Error("Failed to save");
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (!confirm("Discard all changes?")) return;
    loadPlacementData();
    setHasChanges(false);
  };

  const getEffectiveScale = (podiumIndex) => {
    const currentData = placementData[selectedCollection];
    if (!currentData) return 20;
    const baseScale =
      currentData.outfitScaleByIndex?.[podiumIndex] ??
      currentData.outfitScale ??
      0.2;
    return baseScale * 100;
  };

  if (loading)
    return (
      <div className="placement-editor-loading">Loading placement data...</div>
    );

  const collectionIds = Object.keys(placementData || {})
    .map((k) => parseInt(k))
    .sort((a, b) => a - b);
  const currentData = selectedCollection
    ? placementData[selectedCollection]
    : null;
  const podiumNames = ["Left Podium", "Center Podium", "Right Podium"];

  const outfits = selectedCollection
    ? [
        {
          id: 0,
          fileName: `${selectedCollection}_1.png`,
          src: `/assets/transparent/${season}/${selectedCollection}_1.png`,
          label: "Left Podium",
        },
        {
          id: 1,
          fileName: `${selectedCollection}_2.png`,
          src: `/assets/transparent/${season}/${selectedCollection}_2.png`,
          label: "Center Podium",
        },
        {
          id: 2,
          fileName: `${selectedCollection}_3.png`,
          src: `/assets/transparent/${season}/${selectedCollection}_3.png`,
          label: "Right Podium",
        },
      ]
    : [];

  return (
    <div className="placement-editor">
      <div className="placement-editor-header">
        <h3>🎯 Placement Editor - {season}</h3>
        <div className="placement-editor-actions">
          {hasChanges && (
            <>
              <button onClick={discardChanges} className="btn-discard">
                ↩️ Discard
              </button>
              <button
                onClick={savePlacementData}
                className="btn-save"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "💾 Save"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="placement-editor-content">
        <div className="placement-sidebar">
          <div className="config-group">
            <h4>Collections</h4>
            <div className="collection-list">
              {collectionIds.length === 0 ? (
                <div className="no-collections">No collections yet</div>
              ) : (
                collectionIds.map((id) => (
                  <div
                    key={id}
                    className={`collection-item ${
                      selectedCollection === id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedCollection(id);
                      setSelectedPodium(null);
                    }}
                  >
                    Collection #{id}
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedCollection && currentData && (
            <>
              <div className="config-group">
                <h4>Global Scale</h4>
                <label>
                  Default: {(currentData.outfitScale ?? 0.2).toFixed(3)}
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.001"
                  value={currentData.outfitScale ?? 0.2}
                  onChange={(e) => handleGlobalScaleChange(e.target.value)}
                />
                <input
                  type="number"
                  min="0.05"
                  max="0.5"
                  step="0.001"
                  value={currentData.outfitScale ?? 0.2}
                  onChange={(e) => handleGlobalScaleChange(e.target.value)}
                  className="number-input"
                />
              </div>

              {podiumNames.map((name, index) => {
                const pos = currentData.positions?.[index] || { x: 17, y: 30 };
                const scale = getEffectiveScale(index);
                const isSelected = selectedPodium === index;

                return (
                  <div
                    key={index}
                    className={`podium-config ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedPodium(index)}
                  >
                    <h5>{name}</h5>
                    <div className="file-name">{outfits[index]?.fileName}</div>

                    <div className="config-item">
                      <label>X: {pos.x.toFixed(1)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={pos.x}
                        onChange={(e) =>
                          handlePositionChange(index, "x", e.target.value)
                        }
                      />
                    </div>

                    <div className="config-item">
                      <label>Y: {pos.y.toFixed(1)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={pos.y}
                        onChange={(e) =>
                          handlePositionChange(index, "y", e.target.value)
                        }
                      />
                    </div>

                    <div className="config-item">
                      <label>Scale: {(scale / 100).toFixed(3)}</label>
                      <input
                        type="range"
                        min="0.05"
                        max="0.5"
                        step="0.001"
                        value={scale / 100}
                        onChange={(e) =>
                          handleScaleChange(index, e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="placement-preview">
          <div className="preview-header">
            <div className="preview-header-left">
              <h4>Visual Preview</h4>
              <p className="hint">Click and drag outfits to reposition</p>
            </div>
            <div className="preview-header-controls">
              <label className="background-toggle">
                <input
                  type="checkbox"
                  checked={showBackground}
                  onChange={(e) => setShowBackground(e.target.checked)}
                />
                <span>Background</span>
              </label>
              {showBackground && (
                <div className="opacity-control">
                  <label>Opacity: {Math.round(backgroundOpacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={backgroundOpacity}
                    onChange={(e) =>
                      setBackgroundOpacity(parseFloat(e.target.value))
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <div ref={containerRef} className="preview-container">
            <div className="positioning-wrapper">
              {showBackground && (
                <div className="background-image-container">
                  <img
                    ref={backgroundRef}
                    src={`/assets/background/background_${season}.png`}
                    alt="Background"
                    className="background-image"
                    style={{ opacity: backgroundOpacity }}
                    onError={(e) => {
                      e.target.src = "/assets/background/background.png";
                    }}
                  />
                </div>
              )}
              <div className="background-grid" />

              {selectedCollection &&
                currentData &&
                outfits.map((outfit) => {
                  const pos = currentData.positions?.[outfit.id] || {
                    x: 17,
                    y: 30,
                  };
                  const scale = getEffectiveScale(outfit.id);
                  const isSelected = selectedPodium === outfit.id;

                  return (
                    <div
                      key={outfit.id}
                      className={`outfit-preview-wrapper ${
                        isSelected ? "selected" : ""
                      }`}
                      style={{
                        position: "absolute",
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: `${scale}%`,
                        transform: "translate(-50%, -50%)",
                        cursor: isDragging && isSelected ? "grabbing" : "grab",
                        zIndex: isSelected ? 1000 : 10 - outfit.id,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, outfit.id)}
                    >
                      <img
                        src={outfit.src}
                        alt={outfit.label}
                        draggable={false}
                        className="outfit-preview"
                        onError={(e) => {
                          e.target.style.opacity = "0.3";
                        }}
                      />
                      {isSelected && (
                        <div className="selection-indicator">
                          <div className="crosshair-h" />
                          <div className="crosshair-v" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementEditor;

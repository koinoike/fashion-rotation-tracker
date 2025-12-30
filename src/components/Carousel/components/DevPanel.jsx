import React, { useState, useEffect, useRef } from "react";
import { devCache } from "../utils/devPositionCache.js";

const MOBILE_SCALE_MULTIPLIER = 1.08;

export default function DevPanel({
  seasonData,
  item,
  outfits,
  positions,
  hiddenOutfits,
  isMobile,
  onScaleChange,
  onToggleGrid,
  onToggleOutlines,
  showGrid,
  showOutlines,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // New state
  const [position, setPosition] = useState(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const panelWidth = 380;
    const panelHeight = 500;

    return {
      x: (screenWidth - panelWidth) / 2,
      y: Math.max(80, (screenHeight - panelHeight) / 2),
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // Panel dragging handlers
  const handleMouseDown = (e) => {
    if (e.target.closest("input, button")) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Save positions to API
  // Save positions to API
  const handleSave = async () => {
    const dirtyKeys = devCache.getDirtyCollections();
    if (dirtyKeys.length === 0) return;

    setIsSaving(true);
    const savedCollections = [];
    const errors = [];

    try {
      const dataBySeason = devCache.getDataForSave();

      // Iterate seasons (e.g., 'winter', 'spring')
      for (const [season, collections] of Object.entries(dataBySeason)) {
        // Iterate collections (e.g., '1', '8')
        for (const [collectionId, data] of Object.entries(collections)) {
          try {
            const response = await fetch(
              `http://localhost:3001/api/dev/placement/${season}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  collectionId: parseInt(collectionId),
                  positions: data.positions, // These are already cloned in devCache.set
                }),
              }
            );

            if (response.ok) {
              savedCollections.push(`${season}/${collectionId}`);
            } else {
              errors.push(`${season}/${collectionId}`);
            }
          } catch (err) {
            errors.push(`${season}/${collectionId}`);
          }
        }
      }

      if (errors.length === 0) {
        // Detailed success printout
        alert(
          `✅ Successfully saved ${savedCollections.length} collection(s):\n\n` +
            savedCollections.map((s) => `• ${s}`).join("\n")
        );
        devCache.clearDirty();
      } else {
        alert(
          `⚠️ Save completed with issues:\n\n` +
            `✅ Saved: ${savedCollections.join(", ") || "None"}\n` +
            `❌ Failed: ${errors.join(", ")}`
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .dev-panel-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
          transition: all 0.2s;
        }
        .dev-panel-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.7);
        }
        .dev-panel-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
          transition: all 0.2s;
        }
        .dev-panel-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.7);
        }
      `}</style>

      <div
        ref={panelRef}
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 3000,
          display: "flex",
          flexDirection: "column",
          background: "rgba(26, 26, 46, 0.5)", // The 0.5 Alpha Background
          padding: "0",
          borderRadius: "20px",
          border: "1px solid rgba(102, 126, 234, 0.3)",
          minWidth: "380px",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
          backdropFilter: "blur(16px) saturate(180%)",
          overflow: "hidden",
          transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          maxHeight: isCollapsed ? "72px" : "800px", // Dynamic height
        }}
      >
        {/* Decorative gradient bar at top */}
        <div
          style={{
            height: "4px",
            background:
              "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            boxShadow: "0 2px 12px rgba(102, 126, 234, 0.4)",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: isCollapsed
              ? "none"
              : "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#667eea",
                  boxShadow: "0 0 12px rgba(102, 126, 234, 0.8)",
                }}
              />
              <h3
                style={{
                  margin: 0,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "18px",
                  fontWeight: "700",
                  letterSpacing: "-0.5px",
                }}
              >
                {seasonData.path} • {item.id}
              </h3>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {/* RESTORED: Beautiful UI Buttons */}
              <button
                onClick={onToggleGrid}
                style={{
                  padding: "8px 14px",
                  background: showGrid
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  border: showGrid
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.3s",
                  display: isCollapsed ? "none" : "block",
                }}
              >
                {showGrid ? "🎯" : "⬜"} Grid
              </button>

              <button
                onClick={onToggleOutlines}
                style={{
                  padding: "8px 14px",
                  background: showOutlines
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  border: showOutlines
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.3s",
                  display: isCollapsed ? "none" : "block",
                }}
              >
                {showOutlines ? "📦" : "⬜"} Boxes
              </button>

              {/* Toggle Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "all 0.3s",
                }}
              >
                {isCollapsed ? "▼" : "▲"}
              </button>
            </div>
          </div>
        </div>

        {/* Rest of UI - only renders if not collapsed */}
        {!isCollapsed && (
          <>
            <div
              style={{
                padding: "20px 24px",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {outfits.map((outfit, index) => {
                if (hiddenOutfits[index] || !outfit.isValid?.()) return null;
                const pos = positions[index] || { x: 0, y: 0, scale: 0.2 };
                const displayScale =
                  pos.scale * (isMobile ? MOBILE_SCALE_MULTIPLIER : 1);
                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: "24px",
                      padding: "16px",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#fff",
                        }}
                      >
                        {["Left", "Center", "Right"][index]}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        <span style={{ color: "#4ade80" }}>
                          x: {pos.x.toFixed(1)}%
                        </span>
                        <span style={{ color: "#60a5fa" }}>
                          y: {pos.y.toFixed(1)}%
                        </span>
                        <span style={{ color: "#a78bfa" }}>
                          s: {displayScale.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.001"
                      value={pos.scale}
                      onChange={(e) =>
                        onScaleChange(index, parseFloat(e.target.value))
                      }
                      className="dev-panel-slider"
                      style={{
                        width: "100%",
                        height: "6px",
                        borderRadius: "3px",
                        outline: "none",
                        appearance: "none",
                        cursor: "pointer",
                        background: `linear-gradient(to right, #667eea 0%, #667eea ${
                          ((pos.scale - 0.05) / (0.5 - 0.05)) * 100
                        }%, rgba(255, 255, 255, 0.1) ${
                          ((pos.scale - 0.05) / (0.5 - 0.05)) * 100
                        }%, rgba(255, 255, 255, 0.1) 100%)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div
              style={{
                padding: "16px 24px 20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background:
                      devCache.dirtyCount() > 0
                        ? "#fbbf24"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                />
                <span>
                  {devCache.size()} cached •{" "}
                  <span style={{ color: "#fbbf24" }}>
                    {devCache.dirtyCount()} modified
                  </span>
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || devCache.dirtyCount() === 0}
                style={{
                  padding: "14px 24px",
                  width: "100%",
                  background:
                    isSaving || devCache.dirtyCount() === 0
                      ? "rgba(255, 255, 255, 0.08)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "700",
                  opacity: isSaving || devCache.dirtyCount() === 0 ? 0.5 : 1,
                }}
              >
                {isSaving
                  ? "💫 Saving..."
                  : `💾 Save ${devCache.dirtyCount()} Collection(s)`}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

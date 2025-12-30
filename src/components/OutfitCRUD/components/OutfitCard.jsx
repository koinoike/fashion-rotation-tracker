// src/components/OutfitCRUD/components/OutfitCard.jsx - WITH EDIT
import React from "react";
import "./OutfitCard.css";

const OutfitCard = ({
  outfit,
  season,
  newOrder,
  onMarkDeleted,
  onUnmarkDeleted,
  onEdit, // NEW: Edit handler
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging,
  isDropTarget,
}) => {
  const imageSrc = outfit.imagePreview
    ? outfit.imagePreview
    : `/assets/transparent/${season}/${outfit.image}`;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="crud-outfit-card"
      style={{
        opacity: outfit._markedForDeletion ? 0.5 : 1,
        border: isDropTarget
          ? "2px solid #667eea"
          : outfit._markedForDeletion
          ? "2px solid #e74c3c"
          : "1px solid #3a3a3a",
        position: "relative",
        cursor: outfit._markedForDeletion
          ? "not-allowed"
          : draggable
          ? "grab"
          : "default",
        transition: "all 0.2s ease",
        transform: isDragging ? "scale(0.95)" : "scale(1)",
        display: "flex",
        gap: "12px",
        padding: "12px",
      }}
    >
      {/* Order badge */}
      {newOrder !== null && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "#667eea",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: "bold",
            zIndex: 2,
          }}
        >
          #{newOrder}
        </div>
      )}

      {/* Deletion badge */}
      {outfit._markedForDeletion && (
        <div
          style={{
            position: "absolute",
            top: "32px",
            right: "8px",
            background: "#e74c3c",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: "bold",
            zIndex: 2,
          }}
        >
          WILL BE DELETED
        </div>
      )}

      {/* Left side: Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          justifyContent: "space-between",
          minWidth: "36px",
        }}
      >
        {/* Top buttons: Move */}
        {!outfit._markedForDeletion && onMoveUp && onMoveDown && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="crud-move-btn"
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="crud-move-btn"
              title="Move down"
            >
              ↓
            </button>
          </div>
        )}

        {/* Middle button: Edit */}
        {!outfit._markedForDeletion && onEdit && (
          <button
            onClick={() => onEdit(outfit)}
            className="crud-edit-btn"
            title="Edit outfit"
          >
            ✏️
          </button>
        )}

        {/* Bottom button: Delete/Undo */}
        <div style={{ marginTop: "auto" }}>
          {outfit._markedForDeletion ? (
            <button
              onClick={() => onUnmarkDeleted(outfit.id)}
              className="crud-undo-btn"
              title="Undo"
            >
              ↩️
            </button>
          ) : (
            <button
              onClick={() => onMarkDeleted(outfit.id)}
              className="crud-delete-btn"
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="crud-outfit-image">
        <img
          src={imageSrc}
          alt={outfit.setName || `Outfit ${outfit.id}`}
          draggable={false}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML =
              '<div class="crud-no-image">📷</div>';
          }}
        />
      </div>

      {/* Info */}
      <div className="crud-outfit-info">
        <div className="crud-outfit-id">ID: {outfit.id}</div>
        <div className="crud-outfit-name">{outfit.setName || "Unnamed"}</div>
        <div className="crud-outfit-price">
          {outfit.price} {outfit.currency}
        </div>
        {outfit.designer && (
          <div className="crud-outfit-designer">by {outfit.designer}</div>
        )}
      </div>
    </div>
  );
};

export default OutfitCard;

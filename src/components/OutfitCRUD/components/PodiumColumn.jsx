// src/components/OutfitCRUD/components/PodiumColumn.jsx
import React from "react";
import OutfitCard from "./OutfitCard";

const PodiumColumn = ({
  podium,
  outfits,
  season,
  reorder,
  onMarkDeleted,
  onUnmarkDeleted,
  onEdit,
  onDropFromStaging, // ADDED: New prop for staging drops
}) => {
  let newOrderCounter = 0;

  const podiumLabels = {
    left: "⬅️ Left",
    center: "⬆️ Center",
    right: "➡️ Right",
  };

  const handleColumnDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    const outfitId = e.dataTransfer.getData("outfitId");
    const fromStaging = e.dataTransfer.getData("fromStaging");

    if (fromStaging === "true") {
      if (onDropFromStaging) {
        onDropFromStaging(outfitId, podium);
      }
    }
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleColumnDragLeave = (e) => {
    if (e.currentTarget === e.target) {
      e.currentTarget.classList.remove("drag-over");
    }
  };

  return (
    <div
      className="podium-column"
      onDrop={handleColumnDrop}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleColumnDragLeave}
    >
      <div className="podium-header">
        <h3>{podiumLabels[podium]}</h3>
        <span>{outfits.filter((o) => !o._markedForDeletion).length}</span>
      </div>
      <div className="outfits-list">
        {outfits.map((outfit, index) => {
          const newOrder = outfit._markedForDeletion ? null : ++newOrderCounter;
          const isDragging =
            reorder.draggedItem?.podium === podium &&
            reorder.draggedItem?.index === index;
          const isDropTarget =
            reorder.dragOverItem?.podium === podium &&
            reorder.dragOverItem?.index === index;

          return (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              season={season}
              newOrder={newOrder}
              onMarkDeleted={onMarkDeleted}
              onUnmarkDeleted={onUnmarkDeleted}
              onEdit={() => onEdit(outfit)} // FIXED
              // REORDER
              onMoveUp={() => reorder.moveOutfit(podium, index, -1)}
              onMoveDown={() => reorder.moveOutfit(podium, index, 1)}
              canMoveUp={index > 0}
              canMoveDown={index < outfits.length - 1}
              // DRAG & DROP
              draggable={!outfit._markedForDeletion}
              onDragStart={(e) =>
                reorder.handleDragStart(e, podium, index, outfit)
              }
              onDragEnd={reorder.handleDragEnd}
              onDragOver={(e) => reorder.handleDragOver(e, podium, index)}
              onDragLeave={reorder.handleDragLeave}
              onDrop={(e) => reorder.handleDrop(e, podium, index)}
              isDragging={isDragging}
              isDropTarget={isDropTarget}
            />
          );
        })}
        {outfits.length === 0 && <div className="empty-state">No outfits</div>}
      </div>
    </div>
  );
};

export default PodiumColumn;

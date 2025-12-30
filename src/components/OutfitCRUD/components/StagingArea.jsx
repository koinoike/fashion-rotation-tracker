// src/components/OutfitCRUD/components/StagingArea.jsx
import React, { useState } from "react";
import AddEditOutfitModal from "./AddEditOutfitModal";
import "./StagingArea.css";

const StagingArea = ({
  stagedOutfits,
  season,
  onRemoveStaged,
  onAddOutfit,
  onEditStaged,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="staging-area">
      <div className="staging-header">
        <h3>Staging Area</h3>
        <span className="staging-count">
          {stagedOutfits.length} outfit{stagedOutfits.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="staging-content">
        {stagedOutfits.length === 0 ? (
          <div className="staging-empty">
            <p>No outfits staged yet</p>
            <small>
              Add new outfits or drag existing ones here to edit them
            </small>
          </div>
        ) : (
          <div className="staging-grid">
            {stagedOutfits.map((outfit) => (
              <div
                key={outfit.tempId}
                className="staged-outfit-card"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("outfitId", outfit.tempId);
                  e.dataTransfer.setData("fromStaging", "true");
                }}
              >
                <div className="staged-outfit-image">
                  {outfit.imagePreview ? (
                    <img
                      src={outfit.imagePreview}
                      alt={outfit.setName}
                      draggable={false}
                    />
                  ) : (
                    <div className="staged-outfit-placeholder">No Image</div>
                  )}
                </div>

                <div className="staged-outfit-info">
                  <div className="staged-outfit-name" title={outfit.setName}>
                    {outfit.setName}
                  </div>
                  <div className="staged-outfit-price">
                    {outfit.price} {outfit.currency}
                  </div>
                  {outfit.designer && (
                    <div className="staged-outfit-designer">
                      by {outfit.designer}
                    </div>
                  )}
                  <div className="staged-outfit-items-count">
                    {outfit.name?.length || 0} items
                  </div>
                </div>

                <div className="staged-outfit-actions">
                  <button
                    className="staged-outfit-edit"
                    onClick={() => onEditStaged(outfit)}
                    title="Edit staged outfit"
                  >
                    ✏️
                  </button>
                  <button
                    className="staged-outfit-remove"
                    onClick={() => onRemoveStaged(outfit.tempId)}
                    title="Remove from staging"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="staging-actions">
        <button className="btn-add-outfit" onClick={() => setShowModal(true)}>
          <span>+</span> Add New Outfit
        </button>
        <div className="staging-hint">
          💡 Drag outfits to podiums (left/center/right) to assign them
        </div>
      </div>

      <AddEditOutfitModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={onAddOutfit}
        defaultSeason={season}
        season={season}
      />
    </div>
  );
};

export default StagingArea;

// src/components/OutfitCRUD/components/CRUDHeader.jsx
import React from "react";

const CRUDHeader = ({
  hasChanges,
  isSaving,
  isCompacting,
  onSave,
  onDiscard,
  onCompact,
  onClose,
}) => {
  return (
    <div className="outfit-crud-header">
      <div>
        <h2>Outfit CRUD</h2>
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        {hasChanges && (
          <>
            <button
              onClick={onSave}
              disabled={isSaving}
              style={{
                padding: "8px 16px",
                background: "#27ae60",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {isSaving ? "⏳" : "💾 Save"}
            </button>
            <button
              onClick={onDiscard}
              style={{
                padding: "8px 16px",
                background: "#e74c3c",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ❌ Discard
            </button>
          </>
        )}
        <button
          onClick={onCompact}
          disabled={isCompacting || hasChanges}
          style={{
            padding: "8px 16px",
            background: isCompacting || hasChanges ? "#3a3a3a" : "#667eea",
            border: "none",
            borderRadius: "6px",
            color: "white",
            fontWeight: "600",
          }}
        >
          {isCompacting ? "⏳" : "🔢 Compact"}
        </button>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>
    </div>
  );
};

export default CRUDHeader;

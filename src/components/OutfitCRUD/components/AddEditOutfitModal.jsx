// src/components/OutfitCRUD/components/AddEditOutfitModal.jsx
import React, { useState, useRef, useEffect } from "react";
import "./AddEditOutfitModal.css";
import { uploadOutfit } from "../utils/api";

const AddEditOutfitModal = ({
  isOpen,
  onClose,
  onSave,
  defaultSeason,
  editOutfit,
  season,
}) => {
  const isEditMode = !!editOutfit;

  const [formData, setFormData] = useState({
    setName: "",
    nameItems: ["", "", ""],
    price: "",
    currency: "coins",
    designer: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonModalMode, setJsonModalMode] = useState("paste"); // "paste" or "view"
  const [jsonText, setJsonText] = useState("");
  const fileInputRef = useRef(null);

  // Load edit data when modal opens
  useEffect(() => {
    if (isOpen && editOutfit) {
      setFormData({
        setName: editOutfit.setName || "",
        nameItems:
          editOutfit.name && editOutfit.name.length > 0
            ? editOutfit.name
            : editOutfit.nameItems && editOutfit.nameItems.length > 0
            ? editOutfit.nameItems
            : ["", "", ""],
        price: editOutfit.price || "",
        currency: editOutfit.currency || "coins",
        designer: editOutfit.designer || "",
        date: editOutfit.date || new Date().toISOString().split("T")[0],
      });

      // FIXED: Handle image preview correctly for both staged and podium outfits
      if (editOutfit.imagePreview) {
        // Staged outfit or outfit with base64 preview - use directly
        console.log("📷 Using imagePreview (base64 or blob URL)");
        setImagePreview(editOutfit.imagePreview);
      } else if (editOutfit.image) {
        // Existing podium outfit - construct path
        console.log("📷 Using image path:", editOutfit.image);
        setImagePreview(`/assets/transparent/${season}/${editOutfit.image}`);
      } else {
        console.log("📷 No image found");
        setImagePreview(null);
      }

      // Keep reference to existing imageFile if it exists
      if (editOutfit.imageFile) {
        setImageFile(editOutfit.imageFile);
      }
    } else if (isOpen) {
      // Reset for add mode
      setFormData({
        setName: "",
        nameItems: ["", "", ""],
        price: "",
        currency: "coins",
        designer: "",
        date: new Date().toISOString().split("T")[0],
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [isOpen, editOutfit, season]);

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (PNG preferred)");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const addNameItem = () => {
    setFormData({ ...formData, nameItems: [...formData.nameItems, ""] });
  };

  const removeNameItem = (idx) => {
    if (formData.nameItems.length <= 1) {
      alert("Must have at least one item!");
      return;
    }
    setFormData({
      ...formData,
      nameItems: formData.nameItems.filter((_, i) => i !== idx),
    });
  };

  const updateNameItem = (idx, value) => {
    const newItems = [...formData.nameItems];
    newItems[idx] = value;
    setFormData({ ...formData, nameItems: newItems });
  };

  // Get current form data as JSON object
  const getFormDataAsJson = () => {
    const nameArray = formData.nameItems.filter((i) => i.trim() !== "");
    return {
      setName: formData.setName,
      name: nameArray,
      price: formData.price,
      currency: formData.currency,
      designer: formData.designer,
      date: formData.date,
    };
  };

  // Copy current form data as JSON
  const handleCopyJson = () => {
    try {
      const jsonData = getFormDataAsJson();
      const jsonString = JSON.stringify(jsonData, null, 2);

      // Fallback method using textarea
      const textarea = document.createElement("textarea");
      textarea.value = jsonString;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      alert("✅ JSON copied to clipboard!");
    } catch (err) {
      console.error("Copy failed:", err);
      alert("❌ Failed to copy: " + err.message);
    }
  };

  // View current form data as JSON (read-only)
  const handleViewJson = () => {
    const jsonData = getFormDataAsJson();
    const jsonString = JSON.stringify(jsonData, null, 2);
    setJsonText(jsonString);
    setJsonModalMode("view");
    setShowJsonModal(true);
  };

  // Paste JSON to populate form
  const handlePasteJson = () => {
    setJsonText("");
    setJsonModalMode("paste");
    setShowJsonModal(true);
  };

  const applyJsonData = () => {
    try {
      const data = JSON.parse(jsonText);

      setFormData({
        setName: data.setName || "",
        nameItems:
          Array.isArray(data.name) && data.name.length > 0
            ? data.name
            : ["", "", ""],
        price: data.price || "",
        currency: data.currency || "coins",
        designer: data.designer || "",
        date: data.date || new Date().toISOString().split("T")[0],
      });

      setShowJsonModal(false);
      alert("✅ JSON data applied!");
    } catch (err) {
      alert("❌ Invalid JSON: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameArray = formData.nameItems.filter((i) => i.trim() !== "");
    if (!formData.setName.trim() || nameArray.length === 0 || !formData.price) {
      alert("Please fill all required fields");
      return;
    }

    // Build the outfit data object
    const outfitData = {
      setName: formData.setName.trim(),
      nameItems: nameArray, // Keep this for compatibility
      name: nameArray, // Add this for the actual data
      price: formData.price,
      currency: formData.currency,
      designer: formData.designer.trim(),
      date: formData.date,
    };

    // Add editing metadata if in edit mode
    if (isEditMode) {
      outfitData._isEditing = true;
      outfitData._originalId = editOutfit._originalId || editOutfit.id;

      // Keep the podium and order info
      if (editOutfit._podium) {
        outfitData._podium = editOutfit._podium;
      }
      if (editOutfit._order !== undefined) {
        outfitData._order = editOutfit._order;
      }
    } else {
      outfitData._isNew = true;
      outfitData._isEditing = false;
      outfitData.tempId = `new_${Date.now()}`;
    }

    // Handle image
    if (imageFile) {
      // New image file selected
      outfitData.imageFile = imageFile;
      outfitData.imagePreview = imagePreview;
      outfitData.image = imageFile.name;
    } else if (editOutfit?.imagePreview) {
      // Staged outfit - keep the preview
      outfitData.imagePreview = editOutfit.imagePreview;
      if (editOutfit.imageFile) {
        outfitData.imageFile = editOutfit.imageFile;
        outfitData.image = editOutfit.imageFile.name;
      }
    } else if (editOutfit?.image) {
      // Podium outfit - keep existing image path
      outfitData.image = editOutfit.image;
    }

    console.log("📤 Modal submitting outfit data:", outfitData);

    // If editing existing outfit in podium, don't call API yet
    if (isEditMode && !editOutfit.tempId) {
      // This is editing a real outfit, not a staged one
      console.log("📝 Editing existing outfit, calling onSave without API");
      onSave(outfitData);
      handleClose();
      return;
    }

    // For new outfits or staged edits, call API only if not editing
    const outfitId = editOutfit?.id;
    try {
      if (!isEditMode) {
        // Only upload immediately if this is a brand new outfit being added to staging
        // Actually, let's NOT call API here - staging should be local only
        console.log("➕ Adding to staging (no API call)");
      }

      onSave(outfitData);
      handleClose();
    } catch (err) {
      alert("❌ Failed to save outfit: " + err.message);
    }
  };

  const handleClose = () => {
    setFormData({
      setName: "",
      nameItems: ["", "", ""],
      price: "",
      currency: "coins",
      designer: "",
      date: new Date().toISOString().split("T")[0],
    });
    setImagePreview(null);
    setImageFile(null);
    setShowJsonModal(false);
    setJsonText("");
    onClose();
  };

  const handleCopyFromModal = () => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = jsonText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("✅ JSON copied to clipboard!");
    } catch (err) {
      alert("❌ Failed to copy: " + err.message);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{isEditMode ? "✏️ Edit Outfit" : "➕ Add New Outfit"}</h2>
            <div className="modal-header-actions">
              <button
                type="button"
                className="btn-json"
                onClick={handleViewJson}
                title="View form data as JSON"
              >
                👁️ View JSON
              </button>
              <button
                type="button"
                className="btn-json"
                onClick={handleCopyJson}
                title="Copy form data as JSON"
              >
                📋 Copy JSON
              </button>
              <button
                type="button"
                className="btn-json"
                onClick={handlePasteJson}
                title="Paste JSON to fill form"
              >
                📥 Paste JSON
              </button>
              <button className="modal-close" onClick={handleClose}>
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="outfit-form">
            {/* Image Upload */}
            <div className="form-group">
              <label>Image (PNG) *</label>
              <div className="image-upload-area">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="btn-change-image"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    className="image-upload-placeholder"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="upload-icon">📷</div>
                    <p>Click to upload image</p>
                    <small>PNG recommended (transparent background)</small>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            {/* Set Name */}
            <div className="form-group">
              <label htmlFor="set-name">Set Name *</label>
              <input
                id="set-name"
                type="text"
                value={formData.setName}
                onChange={(e) =>
                  setFormData({ ...formData, setName: e.target.value })
                }
                placeholder="e.g., ЗИМНЯЯ ВИШНЯ"
                maxLength={100}
              />
            </div>

            {/* Outfit Items */}
            <div className="form-group">
              <label>Outfit Items *</label>
              <div className="name-items-list">
                {formData.nameItems.map((item, idx) => (
                  <div key={idx} className="name-item-row">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateNameItem(idx, e.target.value)}
                      placeholder={`Item ${idx + 1} (e.g., Парка с рукавицами)`}
                    />
                    {formData.nameItems.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-item"
                        onClick={() => removeNameItem(idx)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-add-item"
                onClick={addNameItem}
              >
                + Add Another Item
              </button>
            </div>

            {/* Price & Currency */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="outfit-price">Price *</label>
                <input
                  id="outfit-price"
                  type="text"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="360"
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency *</label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                >
                  <option value="coins">Coins</option>
                  <option value="rumb">Rumb</option>
                </select>
              </div>
            </div>

            {/* Designer */}
            <div className="form-group">
              <label htmlFor="designer">Designer</label>
              <input
                id="designer"
                type="text"
                value={formData.designer}
                onChange={(e) =>
                  setFormData({ ...formData, designer: e.target.value })
                }
                placeholder="e.g., aesthete"
                maxLength={50}
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label htmlFor="outfit-date">Date</label>
              <input
                id="outfit-date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                {isEditMode ? "💾 Save Changes" : "Add to Staging"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* JSON Modal (View/Paste) */}
      {showJsonModal && (
        <div className="modal-overlay" onClick={() => setShowJsonModal(false)}>
          <div
            className="modal-content json-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {jsonModalMode === "view"
                  ? "👁️ View JSON Data"
                  : "📥 Paste JSON Data"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowJsonModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="json-modal-body">
              <p>
                {jsonModalMode === "view"
                  ? "Current form data as JSON:"
                  : "Paste JSON data to fill the form:"}
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                readOnly={jsonModalMode === "view"}
                placeholder={
                  jsonModalMode === "paste"
                    ? `{\n  "setName": "ЗИМНЯЯ ВИШНЯ",\n  "name": ["Парка с рукавицами", "Сапоги"],\n  "price": "360",\n  "currency": "coins",\n  "designer": "aesthete",\n  "date": "2024-12-21"\n}`
                    : ""
                }
                rows={15}
                style={{
                  width: "100%",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  backgroundColor:
                    jsonModalMode === "view" ? "#f9fafb" : "white",
                }}
              />
              <div className="form-actions" style={{ marginTop: "16px" }}>
                {jsonModalMode === "view" ? (
                  <>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowJsonModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn-submit"
                      onClick={handleCopyFromModal}
                    >
                      📋 Copy to Clipboard
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowJsonModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-submit"
                      onClick={applyJsonData}
                    >
                      Apply JSON
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddEditOutfitModal;

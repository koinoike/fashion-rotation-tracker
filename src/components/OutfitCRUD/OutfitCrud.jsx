// src/components/OutfitCRUD/OutfitCrud.jsx - UPDATED WITHOUT COLLECTION CONFIG PANEL
import React, { useState, useEffect } from "react";
import CRUDHeader from "./components/CRUDHeader";
import SeasonSelector from "./components/SeasonSelector";
import StatsBar from "./components/StatsBar";
import PodiumColumn from "./components/PodiumColumn";
import StagingArea from "./components/StagingArea";
import PlacementEditor from "./components/PlacementEditor";
import { LoadingState, ErrorState } from "./components/StateComponents";
import { useOutfits } from "./hooks/useOutfits";
import { useReorder } from "./hooks/useReorder";
import AddEditOutfitModal from "./components/AddEditOutfitModal";
import {
  deleteOutfit,
  compactIds,
  saveOrder,
  uploadOutfit,
  updateCollections,
  updateOutfitDetails,
} from "./utils/api";
import "./OutfitCrud.css";

const OutfitCRUD = ({ onClose }) => {
  const [season, setSeason] = useState("winter");
  const [isSaving, setIsSaving] = useState(false);
  const [isCompacting, setIsCompacting] = useState(false);
  const [stagedOutfits, setStagedOutfits] = useState([]);
  const [editingOutfit, setEditingOutfit] = useState(null);

  const [collectionConfig, setCollectionConfig] = useState({
    totalCollections: 0,
    layersPerCollection: 3,
  });

  const [collectionConfigChanged, setCollectionConfigChanged] = useState(false);

  const [seasonChanges, setSeasonChanges] = useState({
    winter: { hasChanges: false, outfits: null, originalOutfits: null },
    spring: { hasChanges: false, outfits: null, originalOutfits: null },
    summer: { hasChanges: false, outfits: null, originalOutfits: null },
    autumn: { hasChanges: false, outfits: null, originalOutfits: null },
  });

  const seasons = ["winter", "spring", "summer", "autumn"];

  const { outfits, setOutfits, originalOutfits, loading, error, reload } =
    useOutfits(season);
  const reorder = useReorder(outfits, setOutfits, () =>
    updateSeasonChanges(true)
  );

  const updateSeasonChanges = (hasChanges) => {
    setSeasonChanges((prev) => ({
      ...prev,
      [season]: {
        hasChanges,
        outfits: hasChanges ? outfits : null,
        originalOutfits: hasChanges ? originalOutfits : null,
      },
    }));
  };

  useEffect(() => {
    if (!loading && !error) {
      const saved = seasonChanges[season];
      if (saved.hasChanges && saved.outfits) {
        setOutfits(saved.outfits);
      }
    }
  }, [season, loading]);

  const markAsDeleted = (outfitId) => {
    const newOutfits = { ...outfits };
    newOutfits[outfitId] = { ...outfits[outfitId], _markedForDeletion: true };
    setOutfits(newOutfits);
    updateSeasonChanges(true);
  };

  const unmarkAsDeleted = (outfitId) => {
    const newOutfits = { ...outfits };
    delete newOutfits[outfitId]._markedForDeletion;
    const hasChanges =
      Object.values(newOutfits).some((o) => o._markedForDeletion) ||
      Object.values(newOutfits).some((o) => o._order !== undefined);
    setOutfits(newOutfits);
    updateSeasonChanges(hasChanges);
  };

  const removeFromStaging = (tempId) =>
    setStagedOutfits((prev) => prev.filter((o) => o.tempId !== tempId));

  const addToStaging = (outfit) =>
    setStagedOutfits((prev) => [...prev, outfit]);

  const editInStaging = (updatedOutfit) => {
    console.log("📝 editInStaging called with:", updatedOutfit);
    setStagedOutfits((prev) =>
      prev.map((o) => {
        if (o.tempId === updatedOutfit.tempId) {
          return {
            ...o,
            ...updatedOutfit,
            imagePreview: updatedOutfit.imagePreview || o.imagePreview,
            imageFile: updatedOutfit.imageFile || o.imageFile,
            image: updatedOutfit.image || o.image,
          };
        }
        return o;
      })
    );
  };

  const moveStagedToPodium = (stagedOutfit, targetPodium) => {
    if (stagedOutfit._isEditing && stagedOutfit._originalId) {
      const idStr = String(stagedOutfit._originalId);
      const updatedOutfit = {
        ...outfits[idStr],
        ...stagedOutfit,
        image: stagedOutfit.imageFile
          ? stagedOutfit.imageFile.name
          : outfits[idStr].image,
        _isEdited: true,
      };
      const newOutfits = { ...outfits, [idStr]: updatedOutfit };
      setOutfits(newOutfits);
      updateSeasonChanges(true);
      removeFromStaging(stagedOutfit.tempId);
      return;
    }

    const existingIds = Object.keys(outfits).map((id) => parseInt(id));
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newId = maxId + 1;

    const newOutfit = {
      ...stagedOutfit,
      id: newId,
      _isNew: true,
      _podium: targetPodium,
      _order: 0,
      image:
        stagedOutfit.image ||
        (stagedOutfit.imagePreview && stagedOutfit.imagePreview.name) ||
        null,
      imageFile: stagedOutfit.imageFile,
      _isEditing: false,
    };

    const newOutfits = { ...outfits, [newId]: newOutfit };
    setOutfits(newOutfits);
    updateSeasonChanges(true);
    removeFromStaging(stagedOutfit.tempId);
  };

  const handleEditOutfit = (outfit) => {
    const editData = {
      tempId: `edit_${outfit.id}_${Date.now()}`,
      ...outfit,
      _isEditing: true,
      _originalId: outfit.id,
    };
    setEditingOutfit(editData);
  };

  const handleSaveEdit = async (updatedOutfit) => {
    const idStr = String(updatedOutfit._originalId);
    const currentOutfit = outfits[idStr];

    const updatedOutfitData = {
      ...currentOutfit,
      setName: updatedOutfit.setName,
      name: updatedOutfit.nameItems || updatedOutfit.name,
      price: updatedOutfit.price,
      currency: updatedOutfit.currency,
      designer: updatedOutfit.designer,
      date: updatedOutfit.date,
      _isEdited: true,
      _timestamp: Date.now(),
    };

    if (updatedOutfit.imageFile) {
      updatedOutfitData.imageFile = updatedOutfit.imageFile;
      updatedOutfitData.image = updatedOutfit.imageFile.name;
      updatedOutfitData.imagePreview = updatedOutfit.imagePreview;
    } else if (updatedOutfit.imagePreview && !updatedOutfit.imageFile) {
      updatedOutfitData.imagePreview = updatedOutfit.imagePreview;
    }

    // Update local state immediately
    const newOutfits = { ...outfits, [idStr]: updatedOutfitData };
    setOutfits(newOutfits);
    updateSeasonChanges(true);

    // ---------- SERVER CALL ----------
    try {
      const json = await updateOutfitDetails(
        season,
        updatedOutfit._originalId,
        updatedOutfitData
      );
      console.log("✅ Outfit updated on server:", json.outfitId);
    } catch (err) {
      console.error("❌ Failed to save outfit to server:", err);
      alert(`Failed to save outfit: ${err.message}`);
    }

    setEditingOutfit(null);
  };

  const handleSaveOutfit = (outfit) => {
    if (outfit._isEditing) {
      const inStaging = stagedOutfits.find((o) => o.tempId === outfit.tempId);
      if (inStaging) {
        editInStaging({ ...outfit, _isEditing: true });
      } else {
        handleSaveEdit(outfit);
      }
    } else {
      addToStaging({ ...outfit, _isEditing: false });
    }
  };

  const saveChanges = async () => {
    const seasonsWithChanges = Object.entries(seasonChanges)
      .filter(([_, data]) => data.hasChanges)
      .map(([seasonName]) => seasonName);

    if (
      !seasonsWithChanges.length &&
      stagedOutfits.length === 0 &&
      !collectionConfigChanged
    ) {
      alert("No changes!");
      return;
    }

    const unassignedStaged = stagedOutfits.filter((o) => !o._isEditing);

    if (unassignedStaged.length > 0) {
      alert(`⚠️ Move staged outfits to podium or remove them before saving.`);
      return;
    }

    const confirmMessage = [];
    if (seasonsWithChanges.length > 0) {
      confirmMessage.push(`Outfit changes: ${seasonsWithChanges.join(", ")}`);
    }
    if (collectionConfigChanged) {
      confirmMessage.push(`Collection config: ${season}`);
    }

    if (!confirm(`Save changes for:\n${confirmMessage.join("\n")}`)) return;

    setIsSaving(true);
    try {
      // Save outfit changes
      for (const seasonName of seasonsWithChanges) {
        const data = seasonChanges[seasonName];

        // 1. Delete marked outfits
        for (const [id, o] of Object.entries(data.outfits).filter(
          ([_, o]) => o._markedForDeletion
        )) {
          await deleteOutfit(seasonName, id);
        }

        // 2. Save order
        const hasOrderChanges = Object.values(data.outfits).some(
          (o) => o._order !== undefined || o._podium
        );
        if (hasOrderChanges) {
          const order = { left: [], center: [], right: [] };
          ["left", "center", "right"].forEach((pod) => {
            (reorder.groupedOutfits[pod] || []).forEach((outfit) => {
              if (!outfit._markedForDeletion) {
                order[pod].push(outfit.id);
              }
            });
          });
          await saveOrder(seasonName, order);
        }

        // 3. Upload new outfits
        for (const [id, o] of Object.entries(data.outfits).filter(
          ([_, o]) => o._isNew
        )) {
          console.log(`📤 Uploading new outfit ${id} to ${o._podium}`);
          await uploadOutfit(seasonName, id, o, o._podium);
        }

        // 4. Update edited outfits
        for (const [id, o] of Object.entries(data.outfits).filter(
          ([_, o]) => o._isEdited
        )) {
          console.log(`✏️ Updating edited outfit ${id}`);
          await uploadOutfit(seasonName, id, o, o._podium || "left");
        }
      }

      // Save collection config if changed
      if (collectionConfigChanged) {
        try {
          await updateCollections(season, collectionConfig);
          console.log(`✅ Saved collection config for ${season}`);
        } catch (err) {
          alert(`Error saving collections: ${err.message}`);
        }
      }

      const savedItems = [];
      if (seasonsWithChanges.length > 0)
        savedItems.push(`${seasonsWithChanges.length} season(s)`);
      if (collectionConfigChanged) savedItems.push("collection config");

      alert(`✅ Saved ${savedItems.join(" and ")}!`);
      setSeasonChanges({
        winter: { hasChanges: false, outfits: null, originalOutfits: null },
        spring: { hasChanges: false, outfits: null, originalOutfits: null },
        summer: { hasChanges: false, outfits: null, originalOutfits: null },
        autumn: { hasChanges: false, outfits: null, originalOutfits: null },
      });
      setCollectionConfigChanged(false);
      reload();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    const hasChanges =
      Object.values(seasonChanges).some((d) => d.hasChanges) ||
      stagedOutfits.length > 0;
    if (!hasChanges) return alert("No changes to discard!");
    if (!confirm("Discard all changes?")) return;

    setSeasonChanges({
      winter: { hasChanges: false, outfits: null, originalOutfits: null },
      spring: { hasChanges: false, outfits: null, originalOutfits: null },
      summer: { hasChanges: false, outfits: null, originalOutfits: null },
      autumn: { hasChanges: false, outfits: null, originalOutfits: null },
    });
    setStagedOutfits([]);
    reload();
  };

  const handleCompact = async () => {
    if (stagedOutfits.length > 0) return alert("Clear staging area first!");
    if (!confirm(`Compact ${season}?`)) return;
    setIsCompacting(true);
    try {
      const result = await compactIds(season);
      alert(`✅ ${result.message}`);
      reload();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setIsCompacting(false);
    }
  };

  const hasAnyChanges =
    Object.values(seasonChanges).some((d) => d.hasChanges) ||
    stagedOutfits.length > 0;

  return (
    <div className="outfit-crud-overlay">
      <div className="outfit-crud">
        <CRUDHeader
          hasChanges={hasAnyChanges}
          isSaving={isSaving}
          isCompacting={isCompacting}
          onSave={saveChanges}
          onDiscard={discardChanges}
          onCompact={handleCompact}
          onClose={onClose}
        />

        <SeasonSelector
          seasons={seasons}
          current={season}
          onChange={setSeason}
          hasChanges={false}
          seasonChanges={seasonChanges}
        />

        <StatsBar
          season={season}
          totalOutfits={Object.keys(outfits).length}
          hasChanges={seasonChanges[season].hasChanges}
          configState={collectionConfig}
          setConfigState={setCollectionConfig}
          onConfigChange={(hasChanges) => {
            setCollectionConfigChanged(hasChanges);
            // Don't mark outfit changes, just track config separately
          }}
        />

        <div className="outfit-crud-content">
          <StagingArea
            stagedOutfits={stagedOutfits}
            season={season}
            onRemoveStaged={removeFromStaging}
            onAddOutfit={addToStaging}
            onEditStaged={(outfit) => setEditingOutfit(outfit)}
          />

          {loading && <LoadingState />}
          {error && <ErrorState error={error} onRetry={reload} />}

          {!loading && !error && (
            <div className="podiums-grid">
              {["left", "center", "right"].map((pod) => (
                <PodiumColumn
                  key={pod}
                  podium={pod}
                  outfits={reorder.groupedOutfits[pod]}
                  season={season}
                  reorder={reorder}
                  onMarkDeleted={markAsDeleted}
                  onUnmarkDeleted={unmarkAsDeleted}
                  onEdit={handleEditOutfit}
                  onDropFromStaging={(tempId, targetPodium) => {
                    const staged = stagedOutfits.find(
                      (o) => o.tempId === tempId
                    );
                    if (staged) moveStagedToPodium(staged, targetPodium);
                  }}
                />
              ))}
            </div>
          )}

          {editingOutfit && (
            <AddEditOutfitModal
              isOpen={!!editingOutfit}
              editOutfit={editingOutfit}
              season={season}
              defaultSeason={season}
              onSave={handleSaveOutfit}
              onClose={() => setEditingOutfit(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitCRUD;

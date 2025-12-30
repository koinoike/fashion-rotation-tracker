// src/components/OutfitCRUD/hooks/useReorder.js - DEBUG VERSION
import { useState, useMemo, useEffect } from "react";

export const useReorder = (outfits, setOutfits, setHasChanges) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Debug: Log when outfits change
  useEffect(() => {
    console.log("🔄 useReorder: outfits changed", {
      outfitCount: Object.keys(outfits).length,
      outfits: outfits,
    });
  }, [outfits]);

  // Compute groupedOutfits with detailed logging
  const groupedOutfits = useMemo(() => {
    console.log("🧮 Recalculating groupedOutfits...");

    const grouped = { left: [], center: [], right: [] };

    Object.entries(outfits).forEach(([id, data]) => {
      if (!data) {
        console.warn("⚠️ Skipping null outfit:", id);
        return;
      }

      const podium =
        data._podium || ["left", "center", "right"][(parseInt(id) - 1) % 3];

      if (!grouped[podium]) {
        console.warn("⚠️ Invalid podium:", podium);
        return;
      }

      grouped[podium].push({ id: parseInt(id), ...data });
    });

    // Sort each podium
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        if (a._order !== undefined && b._order !== undefined)
          return a._order - b._order;
        if (a._order !== undefined) return -1;
        if (b._order !== undefined) return 1;
        return a.id - b.id;
      });
    });

    console.log("✅ Grouped outfits:", {
      left: grouped.left.length,
      center: grouped.center.length,
      right: grouped.right.length,
      leftFirst: grouped.left[0]?.setName,
      centerFirst: grouped.center[0]?.setName,
      rightFirst: grouped.right[0]?.setName,
    });

    return grouped;
  }, [outfits]); // This should trigger whenever outfits changes

  const updateOutfitsOrder = (podium, newList) => {
    console.log("📝 updateOutfitsOrder called", {
      podium,
      count: newList.length,
    });

    const newOutfits = { ...outfits };
    newList.forEach((outfit, idx) => {
      newOutfits[outfit.id] = {
        ...newOutfits[outfit.id],
        _podium: podium,
        _order: idx,
      };
    });

    console.log("📝 Setting updated outfits");
    setOutfits(newOutfits);
  };

  const moveOutfit = (podium, fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    const list = groupedOutfits[podium];
    if (toIndex < 0 || toIndex >= list.length) return;

    const newList = [...list];
    const [moved] = newList.splice(fromIndex, 1);
    newList.splice(toIndex, 0, moved);

    updateOutfitsOrder(podium, newList);
    setHasChanges(true);
  };

  const handleDragStart = (e, podium, index, outfit) => {
    setDraggedItem({ podium, index, outfit });
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e, podium, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem({ podium, index });
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, targetPodium, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { podium: sourcePodium, index: sourceIndex, outfit } = draggedItem;

    if (sourcePodium === targetPodium && sourceIndex === targetIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const sourceList = [...groupedOutfits[sourcePodium]];
    sourceList.splice(sourceIndex, 1);

    const targetList =
      sourcePodium === targetPodium
        ? sourceList
        : [...groupedOutfits[targetPodium]];
    targetList.splice(targetIndex, 0, outfit);

    updateOutfitsOrder(sourcePodium, sourceList);
    if (sourcePodium !== targetPodium) {
      updateOutfitsOrder(targetPodium, targetList);
    }

    setDraggedItem(null);
    setDragOverItem(null);
    setHasChanges(true);
  };

  return {
    groupedOutfits,
    moveOutfit,
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

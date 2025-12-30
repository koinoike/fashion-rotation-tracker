import { useState, useEffect, useRef } from "react";

export function useOutfitDrag(
  devMode,
  imageRef,
  positionsRef,
  onPositionUpdate
) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPodium, setSelectedPodium] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [, forceUpdate] = useState({}); // ✅ Force re-render during drag

  const isDraggingRef = useRef(false);
  const selectedPodiumRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Sync refs with state
  useEffect(() => {
    isDraggingRef.current = isDragging;
    selectedPodiumRef.current = selectedPodium;
    dragOffsetRef.current = dragOffset;
  }, [isDragging, selectedPodium, dragOffset]);

  /**
   * Handle mouse down on outfit
   */
  const handleMouseDown = (e, index) => {
    if (!devMode || e.button !== 0 || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const currentPos = positionsRef.current[index];

    // Calculate where the outfit center currently is in pixels
    const outfitCenterX = rect.left + (currentPos.x / 100) * rect.width;
    const outfitCenterY = rect.top + (currentPos.y / 100) * rect.height;

    // Calculate offset from outfit center to mouse click
    const offsetX = e.clientX - outfitCenterX;
    const offsetY = e.clientY - outfitCenterY;

    setDragOffset({ x: offsetX, y: offsetY });
    dragOffsetRef.current = { x: offsetX, y: offsetY };

    console.log(`🖱️ MouseDown outfit ${index}, offset:`, {
      x: offsetX.toFixed(1),
      y: offsetY.toFixed(1),
    });

    setIsDragging(true);
    setSelectedPodium(index);
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handle mouse move (dragging)
   */
  const handleMouseMove = (e) => {
    if (
      !devMode ||
      !isDraggingRef.current ||
      selectedPodiumRef.current === null ||
      !imageRef.current
    )
      return;

    const rect = imageRef.current.getBoundingClientRect();

    // Calculate new position (subtract offset so outfit stays where grabbed)
    const newX =
      ((e.clientX - dragOffsetRef.current.x - rect.left) / rect.width) * 100;
    const newY =
      ((e.clientY - dragOffsetRef.current.y - rect.top) / rect.height) * 100;

    // Update position through callback
    if (onPositionUpdate) {
      onPositionUpdate(selectedPodiumRef.current, newX, newY);
    }

    // ✅ Force re-render to show drag in real-time
    forceUpdate({});
  };

  /**
   * Handle mouse up (stop dragging)
   */
  const handleMouseUp = () => {
    if (!devMode) return;
    // console.log(`MouseUp`);
    setIsDragging(false);
    setSelectedPodium(null);
  };

  // Set up global mouse event listeners
  useEffect(() => {
    if (!devMode) return;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [devMode]);

  return {
    isDragging,
    selectedPodium,
    handleMouseDown,
  };
}

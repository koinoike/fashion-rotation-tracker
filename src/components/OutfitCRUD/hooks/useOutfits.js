// src/components/OutfitCRUD/hooks/useOutfits.js - FINAL с чтением podiumConfig
import { useState, useEffect } from "react";
import { fetchOutfits } from "../utils/api";

export const useOutfits = (season) => {
  const [outfits, setOutfits] = useState({});
  const [originalOutfits, setOriginalOutfits] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOutfits = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Загружаем JSON
      const data = await fetchOutfits(season);

      // 2. Загружаем порядок из podiumConfig
      const configResponse = await fetch(
        `http://localhost:3001/api/dev/config/${season}`
      );

      if (configResponse.ok) {
        const configData = await configResponse.json();

        if (configData.success && configData.config) {
          const { left, center, right } = configData.config;

          // Применяем порядок из podiumConfig
          const enrichedData = {};

          // Left подиум
          left.forEach((id, index) => {
            if (data[id]) {
              enrichedData[id] = {
                ...data[id],
                _podium: "left",
                _order: index,
              };
            }
          });

          // Center подиум
          center.forEach((id, index) => {
            if (data[id]) {
              enrichedData[id] = {
                ...data[id],
                _podium: "center",
                _order: index,
              };
            }
          });

          // Right подиум
          right.forEach((id, index) => {
            if (data[id]) {
              enrichedData[id] = {
                ...data[id],
                _podium: "right",
                _order: index,
              };
            }
          });

          setOutfits(enrichedData);
          setOriginalOutfits(JSON.parse(JSON.stringify(enrichedData)));
        } else {
          // Fallback: если нет podiumConfig
          setOutfits(data);
          setOriginalOutfits(JSON.parse(JSON.stringify(data)));
        }
      } else {
        // Fallback: если запрос не удался
        setOutfits(data);
        setOriginalOutfits(JSON.parse(JSON.stringify(data)));
      }
    } catch (err) {
      console.error("Failed to load outfits:", err);
      setError(err.message);
      setOutfits({});
      setOriginalOutfits({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutfits();
  }, [season]);

  return {
    outfits,
    setOutfits,
    originalOutfits,
    loading,
    error,
    reload: loadOutfits,
  };
};

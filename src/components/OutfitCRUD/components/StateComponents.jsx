// src/components/OutfitCRUD/components/StateComponents.jsx
import React from "react";

export const LoadingState = () => (
  <div className="loading-state">
    <div className="spinner"></div>
    <div>Loading...</div>
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="error-state">
    <div>❌ {error}</div>
    <button onClick={onRetry}>Retry</button>
  </div>
);

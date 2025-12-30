import React, { useState } from "react";
import { getNext3Times } from "../../utils/timeUtils";
import { generateSchedule } from "../../utils/schedule";
import "./Calculator.css";

export default function Calculator({
  index,
  liveIndex,
  tz,
  total,
  onGoToLive,
  outfits,
  season,
}) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isLive = index === liveIndex;
  const occurrences = getNext3Times(index, tz, total);

  const handleCopyWeek = async () => {
    try {
      const weekSchedule = generateSchedule(index, tz, season, total, outfits);
      await navigator.clipboard.writeText(weekSchedule);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
  };

  const weekSchedule = showPreview
    ? generateSchedule(index, tz, season, total, outfits)
    : "";

  return (
    <div className="calculator">
      <h2 className="calculator-title">When will this collection appear?</h2>
      <div className="calculator-content">
        <div className="calculator-result">
          <h3 className="next-occurrences-title">The next 3 time slots:</h3>
          {occurrences.map((t, idx) => {
            const isCurrent = isLive && idx === 0;
            return (
              <div
                key={idx}
                className={`occurrence-block ${
                  isCurrent ? "current-occurrence" : ""
                }`}
              >
                <div className="result-row">
                  <span className="result-label">
                    {isCurrent ? "Current" : `№${idx + 1}`}:
                  </span>
                  <span className="result-value">
                    {t.start} – {t.end}
                  </span>
                </div>
              </div>
            );
          })}
          {isLive && (
            <div className="result-current">
              ✅ The collection is active now!
            </div>
          )}
          <div className="week-schedule-section">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="toggle-preview-button"
            >
              {showPreview
                ? "▼ Hide weekly schedule"
                : "▶ Show weekly schedule"}
            </button>
            {showPreview && (
              <div className="week-preview-container">
                <pre className="week-preview">{weekSchedule}</pre>
                <button onClick={handleCopyWeek} className="copy-week-button">
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
            )}
          </div>
          {!isLive && (
            <button onClick={onGoToLive} className="live-button">
              Return to the live collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

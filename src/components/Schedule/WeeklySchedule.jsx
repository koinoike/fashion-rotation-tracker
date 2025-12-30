import React, { useState, useMemo } from "react";
import { generateSchedule } from "../../utils/schedule";
import { useSeason } from "../../contexts/SeasonContext";
import { getTotalCollections } from "../../constants/seasonConfig";

export default function WeeklySchedule({ collectionId, tz }) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [copied, setCopied] = useState(false);
  const { seasonData } = useSeason();
  const total = getTotalCollections(seasonData.path);

  const scheduleText = useMemo(() => {
    if (!showSchedule) return "";
    return generateSchedule(collectionId, tz, seasonData.path, total);
  }, [collectionId, tz, seasonData.path, total, showSchedule]);

  const handleCopy = async () => {
    if (!scheduleText) return;
    try {
      await navigator.clipboard.writeText(scheduleText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <button
        onClick={() => setShowSchedule((v) => !v)}
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          background: "var(--season-gradient)",
          color: "#fff",
          fontWeight: "600",
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.target.style.opacity = "1")}
      >
        {showSchedule ? "Скрыть расписание" : "Показать расписание на неделю"}
      </button>
      {showSchedule && (
        <div style={{ marginTop: "16px", position: "relative" }}>
          <textarea
            readOnly
            value={scheduleText}
            onClick={handleCopy}
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "200px",
              padding: "12px",
              paddingTop: "40px",
              borderRadius: "8px",
              border: `1px solid ${copied ? "var(--season-primary)" : "#ccc"}`,
              fontFamily: "monospace",
              fontSize: "13px",
              resize: "none",
              overflowY: "auto",
              cursor: "pointer",
              backgroundColor: copied ? "var(--season-accent-04)" : "#fff",
              transition: "all 0.3s",
            }}
            title="Нажмите, чтобы скопировать"
          />
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "12px",
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: copied ? "var(--season-primary)" : "#6b7280",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "600",
              pointerEvents: "none",
              transition: "background-color 0.3s",
            }}
          >
            {copied ? "✓ Скопировано!" : "📋 Нажмите для копирования"}
          </div>
        </div>
      )}
    </div>
  );
}

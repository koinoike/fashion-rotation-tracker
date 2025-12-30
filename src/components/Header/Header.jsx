// src/components/Header/Header.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Header.css";
import { TZ_LIST } from "../../constants/config";
import { useSeason } from "../../contexts/SeasonContext";
import TelegramButton from "../TelegramButton/TelegramButton";

export default function Header({ tz, setTz, currentTime, tzList }) {
  const { currentSeason, setCurrentSeason, seasons } = useSeason();
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isTzDropdownOpen, setIsTzDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const seasonDropdownRef = useRef(null);
  const tzDropdownRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-detect timezone only on first load
  useEffect(() => {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const matchedTz = TZ_LIST.includes(userTz) ? userTz : userTz;
    setTz(matchedTz);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - fires only once on mount

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        seasonDropdownRef.current &&
        !seasonDropdownRef.current.contains(event.target)
      ) {
        setIsSeasonDropdownOpen(false);
      }
      if (
        tzDropdownRef.current &&
        !tzDropdownRef.current.contains(event.target)
      ) {
        setIsTzDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSeasonData = seasons.find((s) => s.id === currentSeason);

  // English city names
  const cityNamesEn = {
    "Europe/Moscow": "Moscow",
    "Europe/Kaliningrad": "Kaliningrad",
    "Europe/Berlin": "Berlin",
    "Asia/Yekaterinburg": "Yekaterinburg",
    "Asia/Omsk": "Omsk",
    "Asia/Novosibirsk": "Novosibirsk",
    "Asia/Novokuznetsk": "Novokuznetsk",
    "Asia/Krasnoyarsk": "Krasnoyarsk",
    "Asia/Irkutsk": "Irkutsk",
    "Asia/Yakutsk": "Yakutsk",
    "Asia/Vladivostok": "Vladivostok",
    "Asia/Magadan": "Magadan",
    "Asia/Sakhalin": "Sakhalin",
    "Asia/Kamchatka": "Kamchatka",
  };

  // Get UTC offset for timezone
  const getTzOffset = (timezone) => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
      });

      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find((part) => part.type === "timeZoneName");

      return offsetPart ? offsetPart.value : "";
    } catch {
      return "";
    }
  };

  // Format timezone name for button display
  const formatTzName = (timezone) => {
    // If we have an English name, use it
    if (cityNamesEn[timezone]) {
      const cityName = cityNamesEn[timezone];
      // ONLY on mobile: if city name is too long, show GMT offset instead
      if (isMobile && cityName.length > 8) {
        return getTzOffset(timezone);
      }
      return cityName;
    }

    // Check if this timezone is in our predefined list
    if (TZ_LIST.includes(timezone)) {
      // It's in the list but no English name - use city name
      const parts = timezone.split("/");
      const city = parts[parts.length - 1].replace(/_/g, " ");
      // ONLY on mobile: if city name is too long, show GMT offset instead
      if (isMobile && city.length > 8) {
        return getTzOffset(timezone);
      }
      return city;
    }

    // Not in our list - it's the device timezone
    return "Time";
  };

  // Format timezone name for dropdown (always full city name)
  const formatTzNameFull = (timezone) => {
    // If we have an English name, use it
    if (cityNamesEn[timezone]) {
      return cityNamesEn[timezone];
    }

    // Check if this timezone is in our predefined list
    if (TZ_LIST.includes(timezone)) {
      // It's in the list but no English name - use city name
      const parts = timezone.split("/");
      const city = parts[parts.length - 1].replace(/_/g, " ");
      return city;
    }

    // Not in our list - it's the device timezone
    return "Device time";
  };

  return (
    <div className="header">
      {/* Season Selector - left */}
      <div className="season-block">
        <div className="season-dropdown" ref={seasonDropdownRef}>
          <button
            className="season-button"
            onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
          >
            <span className="season-icon">{currentSeasonData?.icon}</span>
            <span className="season-name">{currentSeasonData?.name}</span>
          </button>

          <div
            className={`season-dropdown-menu ${
              isSeasonDropdownOpen ? "open" : ""
            }`}
          >
            {seasons.map((season) => (
              <div
                key={season.id}
                className={`season-option ${
                  currentSeason === season.id ? "selected" : ""
                }`}
                onClick={() => {
                  setCurrentSeason(season.id);
                  setIsSeasonDropdownOpen(false);
                }}
              >
                <span className="season-option-icon">{season.icon}</span>
                <div className="season-option-content">
                  <div className="season-option-label">{season.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <span className="season-divider"></span>
      </div>

      {/* Clock - center */}
      <div className="center-block">
        <div className="clock">{currentTime}</div>
      </div>

      {/* Timezone Block - right */}
      <div className="timezone-block">
        <div className="timezone-dropdown" ref={tzDropdownRef}>
          <button
            className="timezone-button"
            onClick={() => setIsTzDropdownOpen(!isTzDropdownOpen)}
          >
            <span className="timezone-name">{formatTzName(tz)}</span>
          </button>

          <div
            className={`timezone-dropdown-menu ${
              isTzDropdownOpen ? "open" : ""
            }`}
          >
            {/* Show "Device time" ONLY if current timezone is NOT in the list */}
            {!TZ_LIST.includes(tz) && (
              <>
                <div
                  className="timezone-option selected"
                  onClick={() => {
                    setIsTzDropdownOpen(false);
                  }}
                >
                  <div className="timezone-option-content">
                    <div className="timezone-option-label">Device time</div>
                    <div className="timezone-option-subtitle">
                      {getTzOffset(tz)}
                    </div>
                  </div>
                </div>
                {/* Separator line */}
                <div
                  style={{
                    height: "1px",
                    background: "rgba(0,0,0,0.1)",
                    margin: "4px 0",
                  }}
                />
              </>
            )}
            {TZ_LIST.map((timezone) => (
              <div
                key={timezone}
                className={`timezone-option ${
                  timezone === tz ? "selected" : ""
                }`}
                onClick={() => {
                  setTz(timezone);
                  setIsTzDropdownOpen(false);
                }}
              >
                <div className="timezone-option-content">
                  <div className="timezone-option-label">
                    {formatTzNameFull(timezone)}
                  </div>
                  <div className="timezone-option-subtitle">
                    {getTzOffset(timezone)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="timezone-divider"></div>
      </div>
    </div>
  );
}

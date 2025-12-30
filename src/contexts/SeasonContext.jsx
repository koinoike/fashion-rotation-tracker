import { createContext, useContext, useState, useEffect } from "react";
import { MANUAL_SEASON } from "../constants/seasonConfig";

const SeasonContext = createContext(null);

const ALL_SEASONS = [
  { id: "winter", name: "Winter", icon: "❄️" },
  { id: "spring", name: "Spring", icon: "🌸" },
  { id: "summer", name: "Summer", icon: "☀️" },
  { id: "autumn", name: "Autumn", icon: "🍂" },
];

export const SeasonProvider = ({ children }) => {
  const [currentSeason, setCurrentSeason] = useState(MANUAL_SEASON);

  const seasonData = {
    id: currentSeason,
    path: currentSeason,
  };

  useEffect(() => {
    document.body.setAttribute("data-season", currentSeason);

    return () => {
      document.body.removeAttribute("data-season");
    };
  }, [currentSeason]);

  return (
    <SeasonContext.Provider
      value={{
        currentSeason,
        setCurrentSeason,
        seasonData,
        seasons: ALL_SEASONS,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) throw new Error("useSeason must be used within SeasonProvider");
  return context;
};

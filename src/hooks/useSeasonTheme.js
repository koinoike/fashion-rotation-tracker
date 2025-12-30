import { useEffect } from "react";
import { useSeason } from "../contexts/SeasonContext";

export const useSeasonTheme = () => {
  const { currentSeason } = useSeason();

  useEffect(() => {
    // Set the data-season attribute on body
    // This triggers the CSS variables defined in body[data-season="..."]
    document.body.setAttribute("data-season", currentSeason || "winter");

    // Optional: Clean up on unmount
    return () => {
      document.body.removeAttribute("data-season");
    };
  }, [currentSeason]);

  // Return the current season in case components need it
  return { currentSeason };
};

// Configuration: Set to true to use current year as fallback when date is missing
// true: missing date → use current year (e.g., "Мандарино_зима 2025.png")
// false: missing date → omit year (e.g., "Мандарино_зима.png")
export const USE_CURRENT_YEAR_AS_FALLBACK = true;

// Season names in Russian
const SEASON_NAMES_RU = {
  winter: "winter",
  spring: "spring",
  summer: "summer",
  autumn: "autumn",
};

/**
 * Capitalize only the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - String with only first letter capitalized
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Extract year from date string
 * @param {string} dateString - Date in format "YYYY-MM-DD"
 * @returns {string|null} - Year as string, or null/current year based on config
 */
const getYearFromDate = (dateString) => {
  if (!dateString) {
    return USE_CURRENT_YEAR_AS_FALLBACK
      ? new Date().getFullYear().toString()
      : null;
  }

  try {
    const year = dateString.split("-")[0];
    if (year && year.length === 4) {
      return year;
    }
    return USE_CURRENT_YEAR_AS_FALLBACK
      ? new Date().getFullYear().toString()
      : null;
  } catch {
    return USE_CURRENT_YEAR_AS_FALLBACK
      ? new Date().getFullYear().toString()
      : null;
  }
};

/**
 * Generate filename for item download
 * Format: "Set name_Season Year.png" or "Set name_Season.png"
 * Year is included if:
 * - Date exists in JSON → use that year
 * - Date missing + USE_CURRENT_YEAR_AS_FALLBACK = true → use current year
 * - Date missing + USE_CURRENT_YEAR_AS_FALLBACK = false → omit year
 *
 * Examples:
 * - "Мандарино_зима 2024.png" (date exists)
 * - "Мандарино_зима 2025.png" (fallback enabled, no date)
 * - "Мандарино_зима.png" (fallback disabled, no date)
 *
 * @param {string} season - Season ID (winter, spring, summer, autumn)
 * @param {string} setName - Name of the set/outfit
 * @param {string} date - Date string in format "YYYY-MM-DD"
 * @returns {string} - Formatted filename
 */
export const generateItemFilename = (season, setName, date) => {
  const seasonNameRu = SEASON_NAMES_RU[season] || "winter";
  const formattedSetName = capitalizeFirstLetter(setName || "");
  const year = getYearFromDate(date);

  if (year) {
    return `${formattedSetName} - ${seasonNameRu} ${year}.png`;
  } else {
    return `${formattedSetName} - ${seasonNameRu}.png`;
  }
};

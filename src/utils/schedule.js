import { INTERVAL } from "../constants/config";
import { getPricesForSeason } from "../utils/pricesLoader";
import { getNextWeekTimes } from "./timeUtils";
import { MANUAL_SEASON } from "../constants/seasonConfig";

export function generateSchedule(
  collectionId,
  tz,
  season = MANUAL_SEASON,
  total, // Now required - no default value
  outfits = null // ✅ Optional: actual outfits being displayed
) {
  let collectionSets;

  if (outfits && outfits.length > 0) {
    // Use the actual outfits being displayed (for independent podiums)
    collectionSets = outfits.map((outfit) => ({
      setName: outfit.setName,
      currency: outfit.currency,
      price: outfit.price,
    }));
  } else {
    // Fallback to getting prices from season data (for normal collections)
    const pricesInfo = getPricesForSeason(season);
    collectionSets = pricesInfo[String(collectionId)];
  }

  if (
    !collectionSets ||
    !Array.isArray(collectionSets) ||
    collectionSets.length === 0
  ) {
    return `No data for collection ${collectionId}`;
  }

  // Currency emojis
  const currencyEmoji = {
    coins: "🟡",
    rumb: "♦️",
  };

  // Format set information
  const setsInfo = collectionSets
    .map((set) => {
      const emoji = currencyEmoji[set.currency] || "💎";
      const priceText = set.price ? ` (${set.price} ${emoji})` : "";
      return `${set.setName}${priceText}`;
    })
    .join("\n   • ");

  const occurrences = getNextWeekTimes(collectionId, tz, total);

  // Function to get day name in English
  const getDayName = (dateStr) => {
    const [day, month] = dateStr.split(", ")[0].split(".");

    // Determine the correct year based on the month
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const targetMonth = parseInt(month);

    // If we're in December and the target month is January, use next year
    // If we're in January and the target month is December, use previous year
    let year = new Date().getFullYear();
    if (currentMonth === 12 && targetMonth === 1) {
      year += 1;
    } else if (currentMonth === 1 && targetMonth === 12) {
      year -= 1;
    }

    const date = new Date(year, targetMonth - 1, parseInt(day));
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  // Function to format date in English
  const formatEnglishDate = (dateStr) => {
    const [day, month] = dateStr.split(", ")[0].split(".");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  // Function to format timezone in English
  const formatTimezone = (timezone) => {
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

    // List of known timezones
    const knownTimezones = [
      "Europe/Moscow",
      "Europe/Kaliningrad",
      "Europe/Berlin",
      "Asia/Yekaterinburg",
      "Asia/Omsk",
      "Asia/Novosibirsk",
      "Asia/Novokuznetsk",
      "Asia/Krasnoyarsk",
      "Asia/Irkutsk",
      "Asia/Yakutsk",
      "Asia/Vladivostok",
      "Asia/Magadan",
      "Asia/Sakhalin",
      "Asia/Kamchatka",
    ];

    // If there's an English name
    if (cityNamesEn[timezone]) {
      return cityNamesEn[timezone];
    }

    // If timezone is not in our list - it's device timezone
    if (!knownTimezones.includes(timezone)) {
      return "device time";
    }

    // Get GMT offset
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
      });

      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find((part) => part.type === "timeZoneName");

      if (offsetPart && offsetPart.value) {
        return offsetPart.value; // Will return GMT+1, GMT+3, etc.
      }
    } catch (error) {
      console.warn("Failed to get timezone offset:", error);
    }

    // Fallback - just city name from timezone
    const parts = timezone.split("/");
    return parts[parts.length - 1].replace(/_/g, " ");
  };

  // Group by days
  let currentDay = "";
  const formattedList = occurrences
    .map((t, idx) => {
      const dayPart = t.start.split(", ")[0];
      const dayName = getDayName(t.start);
      const englishDate = formatEnglishDate(t.start);
      const timeStart = t.start.split(", ")[1];
      const timeEnd = t.end.split(", ")[1];

      let line = "";
      if (dayPart !== currentDay) {
        currentDay = dayPart;
        line = `\n📅 ${englishDate} (${dayName})\n`;
      }

      line += `   ${String(idx + 1).padStart(
        2,
        " "
      )}. ${timeStart} - ${timeEnd}`;
      return line;
    })
    .join("\n");

  const header = `🛍️ Collection number ${collectionId}:\n   • ${setsInfo}\n\n⏰ Schedule (${formatTimezone(
    tz
  )}):`;
  return `${header}${formattedList}`;
}

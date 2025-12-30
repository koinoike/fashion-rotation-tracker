import { getCollectionOrder, getTotalCollections } from "./seasonConfig.js";

// Размер экспортируемого изображения PNG
export const PNG_EXPORT_WIDTH = 500;
export const PNG_EXPORT_HEIGHT = 700;
export const INTERVAL = 10; // in minutes

// December 11th:
// export const INTERVAL = 10; // in minutes
// export const START_DATE = new Date("2025-12-17T23:20:00Z");
// export const START_COLLECTION = 3;

// December 23rd:
export const START_DATE = new Date("2025-12-23T01:10:00Z"); // UTC time for 02:16 Berlin
export const START_COLLECTION = 10; // collection number

export const TZ_LIST = [
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

/**
 * Генерация элементов сезона
 * SIMPLIFIED: Just generates a list of collections 1, 2, 3, etc.
 * The actual outfit mixing happens in CarouselImage based on timeIndex
 *
 * @param {string} seasonPath - Путь к сезону (winter, spring, summer, autumn)
 * @returns {Array} - Массив объектов {id, displayNumber, src, title}
 */
export const getSeasonItems = (seasonPath = "winter") => {
  // Just get standard order [1, 2, 3, ..., N]
  const collectionOrder = getCollectionOrder(seasonPath);

  const items = collectionOrder.map((collectionId, index) => {
    const displayNumber = index + 1; // Position: 1, 2, 3...
    const itemSrc = `/assets/transparent/${seasonPath}/${collectionId}_1.png`;

    return {
      id: collectionId, // Collection ID: 1, 2, 3...
      displayNumber: displayNumber, // Position in UI: 1, 2, 3...
      src: itemSrc, // Thumbnail for the collection picker
      title: `Collection nr. ${collectionId}`,
      // test to trigger deployment on Vercel
    };
  });

  return items;
};

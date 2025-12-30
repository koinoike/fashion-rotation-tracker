// Prices loading depending on the season

import pricesWinter from "../constants/prices-winter.json";
import pricesSpring from "../constants/prices-spring.json";
import pricesSummer from "../constants/prices-summer.json";
import pricesAutumn from "../constants/prices-autumn.json";

const pricesBySeason = {
  winter: pricesWinter,
  spring: pricesSpring,
  summer: pricesSummer,
  autumn: pricesAutumn,
};

/**
 * Получить цены для определённого сезона
 * @param {string} season - ID сезона ('winter', 'spring', 'summer', 'autumn')
 * @returns {object} - Объект с ценами
 */
export const getPricesForSeason = (season) => {
  const prices = pricesBySeason[season];

  if (!prices) {
    console.warn(
      `⚠️ Цены для сезона "${season}" не найдены, используем зимние`
    );
    return pricesWinter;
  }

  return prices;
};

/**
 * Получить данные наряда по ID
 * @param {string} season - ID сезона
 * @param {string|number} outfitId - ID наряда из JSON
 * @returns {object|null} - Данные наряда
 */
export const getOutfitById = (season, outfitId) => {
  const seasonPrices = getPricesForSeason(season);
  const outfit = seasonPrices[String(outfitId)];

  if (!outfit) {
    console.warn(`⚠️ Наряд ${outfitId} в сезоне ${season} не найден`);
    return null;
  }

  return outfit;
};

/**
 * Получить цены для конкретной коллекции в сезоне
 * В новой структуре: возвращает массив из 3 нарядов по collectionId
 * collectionId=1 → ID [1,2,3], collectionId=2 → ID [4,5,6], и т.д.
 *
 * @param {string} season - ID сезона
 * @param {number} collectionId - ID коллекции (1, 2, 3, ...)
 * @returns {object} - Объект вида { [collectionId]: [outfit1, outfit2, outfit3] }
 */
export const getPricesForCollection = (season, collectionId) => {
  const seasonPrices = getPricesForSeason(season);

  // Calculate which outfit IDs belong to this collection
  // Collection 1 → IDs 1,2,3
  // Collection 2 → IDs 4,5,6
  // Collection 3 → IDs 7,8,9, etc.
  const startId = (collectionId - 1) * 3 + 1;
  const outfitIds = [startId, startId + 1, startId + 2];

  const collectionOutfits = outfitIds
    .map((id) => {
      const outfit = seasonPrices[String(id)];
      if (!outfit) {
        console.warn(
          `⚠️ Наряд ID ${id} не найден для коллекции ${collectionId}`
        );
        return null;
      }
      return {
        ...outfit,
        outfitId: id, // Add the ID for reference
      };
    })
    .filter(Boolean); // Remove nulls

  if (collectionOutfits.length === 0) {
    console.warn(
      `⚠️ Цены для коллекции ${collectionId} в сезоне ${season} не найдены`
    );
    return { [collectionId]: [] };
  }

  return { [collectionId]: collectionOutfits };
};

/**
 * Проверка: сезон имеет независимые подиумы
 * @param {string} season
 * @returns {boolean}
 */
export const hasIndependentPodiums = (season) => {
  try {
    const { PODIUM_FILES } = require("../constants/seasonConfig");
    return PODIUM_FILES[season] !== undefined;
  } catch {
    return false;
  }
};

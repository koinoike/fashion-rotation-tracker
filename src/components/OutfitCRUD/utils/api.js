// src/components/OutfitCRUD/utils/api.js - COMPLETE
// API функции для работы с сервером

const DEV_SERVER_URL = "http://localhost:3001";

/**
 * Health check
 */
export const healthCheck = async () => {
  const response = await fetch(`${DEV_SERVER_URL}/api/dev/health`);
  return response.json();
};

/**
 * Получить все наряды для сезона
 */
export const fetchOutfits = async (season) => {
  const response = await fetch(`${DEV_SERVER_URL}/api/dev/prices/${season}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Удалить наряд
 */
export const deleteOutfit = async (season, outfitId) => {
  const response = await fetch(
    `${DEV_SERVER_URL}/api/dev/outfit/${season}/${outfitId}`,
    {
      method: "DELETE",
    }
  );
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Delete failed");
  }
  return result;
};

/**
 * Компактная перенумерация ID
 */
export const compactIds = async (season) => {
  const response = await fetch(`${DEV_SERVER_URL}/api/dev/compact/${season}`, {
    method: "POST",
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Compact failed");
  }
  return result;
};

/**
 * Сохранить новый порядок в podiumConfig
 * @param {string} season - Сезон (winter, spring, summer, autumn)
 * @param {Object} order - Порядок нарядов { left: [...], center: [...], right: [...] }
 */
export const saveOrder = async (season, order) => {
  console.log(`💾 Saving order for ${season}:`, order);

  const response = await fetch(`${DEV_SERVER_URL}/api/dev/order/${season}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Save order failed");
  }

  return result;
};

/**
 * Загрузить новый наряд на сервер
 * @param {string} season - Сезон
 * @param {number} id - ID наряда
 * @param {Object} outfit - Данные наряда
 * @param {string} podium - Подиум (left/center/right)
 */
export const uploadOutfit = async (season, id, outfit, podium) => {
  console.log(`📤 Uploading outfit ${id} for ${season}:`, outfit);

  const formData = new FormData();

  // Добавляем данные наряда
  formData.append("setName", outfit.setName || "");
  formData.append("price", outfit.price || 0);
  formData.append("currency", outfit.currency || "coins");
  formData.append("name", JSON.stringify(outfit.name || []));
  formData.append("designer", outfit.designer || "");
  formData.append(
    "date",
    outfit.date || new Date().toISOString().split("T")[0]
  );
  formData.append("podium", podium || "left");

  // Добавляем изображение (если есть)
  if (outfit.imageFile) {
    formData.append("image", outfit.imageFile);
  }

  const response = await fetch(
    `${DEV_SERVER_URL}/api/dev/outfit/${season}/${id}`,
    {
      method: "POST",
      body: formData, // Не указываем Content-Type - FormData сам установит
    }
  );

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Upload failed");
  }

  return result;
};

/**
 * Получить конфигурацию коллекций
 */
export const fetchCollections = async () => {
  const response = await fetch(`${DEV_SERVER_URL}/api/dev/collections`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Fetch collections failed");
  }
  return result.seasonConfig || {};
};

/**
 * Обновить конфигурацию коллекций для сезона
 * @param {string} season - Сезон
 * @param {Object} config - { totalCollections, layersPerCollection }
 */
export const updateCollections = async (season, config) => {
  const response = await fetch(
    `${DEV_SERVER_URL}/api/dev/collections/${season}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }
  );

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Update collections failed");
  }

  return result;
};

/**
 * Сохранить позиции и размеры нарядов для DevMode
 * @param {string} season - Сезон (winter, spring, summer, autumn)
 * @param {number} collectionId - ID коллекции
 * @param {Array} positions - [{ podiumIndex, x, y, scale }]
 */
export const savePlacement = async (season, collectionId, positions) => {
  console.log(
    `💾 Saving placement for ${season} collection ${collectionId}:`,
    positions
  );

  const response = await fetch(
    `${DEV_SERVER_URL}/api/dev/placement/${season}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId, positions }),
    }
  );

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Save placement failed");
  }

  return result;
};

/**
 * Update full outfit details (all fields + optional image)
 * @param {string} season - Сезон
 * @param {number|string} id - ID наряда
 * @param {Object} outfit - Наряд { setName, name, price, currency, designer, date, imageFile }
 */
export const updateOutfitDetails = async (season, id, outfit) => {
  const formData = new FormData();

  formData.append("setName", outfit.setName || "");
  formData.append("price", outfit.price || 0);
  formData.append("currency", outfit.currency || "coins");
  formData.append("name", JSON.stringify(outfit.name || []));
  formData.append("designer", outfit.designer || "");
  formData.append(
    "date",
    outfit.date || new Date().toISOString().split("T")[0]
  );

  if (outfit.imageFile) {
    formData.append("image", outfit.imageFile);
  }

  const response = await fetch(
    `${DEV_SERVER_URL}/api/dev/outfit/details/${season}/${id}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Update outfit failed");
  }

  return result;
};

import { getPricesForCollection } from "../../utils/pricesLoader";

console.log("=== Carousel outfits Test ===");

// data imitation
const seasonPath = "winter";
const collectionId = 1;

const pricesWithId = getPricesForCollection(seasonPath, collectionId);

console.log("📦 pricesWithId:", pricesWithId);
console.log("📦 Type:", typeof pricesWithId);
console.log("📦 Is Array?", Array.isArray(pricesWithId));
console.log("📦 Is Object?", pricesWithId && typeof pricesWithId === "object");

if (pricesWithId) {
  console.log("📦 Keys:", Object.keys(pricesWithId));
  console.log("📦 pricesWithId[1]:", pricesWithId[1]);
  console.log('📦 pricesWithId["1"]:', pricesWithId["1"]);
}

console.log("=== Test Complete ===");

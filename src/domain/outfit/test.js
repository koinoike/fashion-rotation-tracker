import { Outfit } from "./OutfitModel";
import { outfitService } from "./outfitService";

console.log("✅ OutfitModel imported successfully");
console.log("✅ outfitService imported successfully");

// Простой тест
const testOutfit = new Outfit(
  {
    price: "1500",
    currency: "coins",
    setName: "Тестовый наряд",
    name: ["Деталь 1", "Деталь 2"],
    designer: "Тестовый дизайнер",
    date: "2025-12-11",
  },
  {
    collectionId: 1,
    podiumIndex: 0,
    season: "winter",
  }
);

console.log("✅ Outfit created:", testOutfit.setName);
console.log("✅ Display price:", testOutfit.displayPrice);
console.log("✅ Currency icon:", testOutfit.currencyIcon);
console.log("✅ Is valid:", testOutfit.isValid());

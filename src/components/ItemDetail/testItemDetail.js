// src/features/item-details/components/testItemDetail.js
import { Outfit } from "../../domain/outfit/OutfitModel";

// Создаём тестовый outfit
const testOutfit = new Outfit(
  {
    price: "360",
    currency: "coins",
    setName: "ВОЛШЕБНАЯ ПРОГУЛКА",
    name: [
      'Причёска "Горячий шоколад"',
      'Курточка "Морозец"',
      "Ботиночки с гетрами",
    ],
    designer: "няша котяша8",
    date: "2025-12-11",
  },
  {
    collectionId: 1,
    podiumIndex: 0,
    season: "winter",
  }
);

console.log("=== ItemDetail Test ===");
console.log("✅ Test outfit created");
console.log("Valid:", testOutfit.isValid());
console.log("Display price:", testOutfit.displayPrice);
console.log("Currency icon:", testOutfit.currencyIcon);

const detail = testOutfit.toDetailCard();
console.log("✅ Detail card:", detail);
console.log("Has details:", detail.details.length, "items");

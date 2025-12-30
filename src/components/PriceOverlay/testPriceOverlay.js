// src/features/runway/components/testPriceOverlay.js
import { Outfit } from "../../domain/outfit/OutfitModel";

console.log("=== PriceOverlay Test ===");

// Создаём тестовые outfits
const testOutfits = [
  new Outfit(
    {
      price: "360",
      currency: "coins",
      setName: "ВОЛШЕБНАЯ ПРОГУЛКА",
      name: ["Причёска", "Курточка", "Ботиночки"],
      designer: "дизайнер1",
      date: "2025-12-11",
    },
    {
      collectionId: 1,
      podiumIndex: 0,
      season: "winter",
    }
  ),
  new Outfit(
    {
      price: "360",
      currency: "coins",
      setName: "ЗИМНИЙ СОН",
      name: ["Причёска", "Худи", "Тапочки"],
      designer: "дизайнер2",
      date: "2025-12-11",
    },
    {
      collectionId: 1,
      podiumIndex: 1,
      season: "winter",
    }
  ),
  new Outfit(
    {
      price: "40",
      currency: "rumb",
      setName: "ПУШИСТИК",
      name: ["Шапка", "Шубка", "Ботинки"],
      designer: "дизайнер3",
      date: "2025-12-11",
    },
    {
      collectionId: 1,
      podiumIndex: 2,
      season: "winter",
    }
  ),
];

// console.log("✅ Created", testOutfits.length, "test outfits");

testOutfits.forEach((outfit, i) => {
  console.log(`Outfit ${i}:`, {
    valid: outfit.isValid(),
    setName: outfit.setName,
    displayPrice: outfit.displayPrice,
    currencyIcon: outfit.currencyIcon,
    hasDetails: outfit.hasDetails,
    details: outfit.details,
  });
});

// console.log("✅ PriceOverlay test complete");

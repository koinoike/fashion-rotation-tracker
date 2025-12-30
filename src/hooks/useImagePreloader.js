import { useEffect } from "react";

export function useImagePreloader(items) {
  useEffect(() => {
    // Preload item images
    items.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });

    // Preload currency icons
    const currencies = ["coin.png", "rumb.png"];
    currencies.forEach((currency) => {
      const img = new Image();
      img.src = `/assets/currencies/${currency}`;
    });

    // Preload closeup images (1_1.png through 21_3.png)
    // for (let collectionId = 1; collectionId <= 21; collectionId++) {
    //   for (let itemNum = 1; itemNum <= 3; itemNum++) {
    //     const img = new Image();
    //     img.src = `/assets/closeups/${collectionId}_${itemNum}.png`;
    //   }
    // }
  }, [items]);
}

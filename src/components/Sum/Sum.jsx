import React from "react";
import { PriceDisplay } from "../../utils/priceUtils";
import "./Sum.css";

export default function Sum({ collections }) {
  const allItems = Object.values(collections).flat();

  const total = allItems.reduce(
    (acc, item) => {
      const price = Number(item.price);
      if (item.currency === "coins") acc.coins += price;
      if (item.currency === "rumb") acc.rumb += price;
      return acc;
    },
    { coins: 0, rumb: 0 }
  );

  return (
    <div className="summary-footer">
      <p>
        Чтобы купить всё: <PriceDisplay price={total.coins} currency="coins" />{" "}
        и <PriceDisplay price={total.rumb} currency="rumb" />
      </p>
    </div>
  );
}

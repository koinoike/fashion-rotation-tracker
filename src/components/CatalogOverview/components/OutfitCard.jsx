import React from "react";
import { PriceDisplay } from "../../../utils/priceUtils.jsx";

export function OutfitCard({ item, selected, toggleOutfit, dimmed }) {
  return (
    <div className={`outfit-card ${dimmed ? "dimmed" : ""}`}>
      <div className="thumb">
        <img src={item.src} alt={item.label} />
        <button
          className={`toggle ${selected[item.key] ? "active" : ""}`}
          onClick={() => toggleOutfit(item.key)}
        >
          {selected[item.key] ? "−" : "+"}
        </button>
        <div className="price-badge">
          <PriceDisplay
            price={item.price}
            currency={item.currency}
            size="small"
          />
        </div>
      </div>
      <div className="real-name">
        <span className="name">{item.realName}</span>
        <span className="collection-number">
          {`Collection nr. ${item.collectionId}`}
        </span>
      </div>
    </div>
  );
}

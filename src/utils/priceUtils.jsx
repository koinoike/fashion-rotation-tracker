import React from "react";

export function PriceDisplay({ price, currency, size = "medium" }) {
  const sizes = {
    small: { text: "12px", icon: "16px" },
    medium: { text: "14px", icon: "20px" },
    large: { text: "24px", icon: "28px" },
  };

  const currentSize = sizes[size];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: currentSize.text,
        fontWeight: "bold",
      }}
    >
      {price}{" "}
      <img
        src={`/assets/currencies/${
          currency === "coins" ? "coin.png" : "rumb.png"
        }`}
        alt={currency}
        style={{
          width: currentSize.icon,
          height: currentSize.icon,
          verticalAlign: "middle",
        }}
      />
    </span>
  );
}

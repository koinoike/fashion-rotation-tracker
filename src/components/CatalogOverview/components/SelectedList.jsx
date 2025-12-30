import React from "react";

export function SelectedList({ outfits, selected }) {
  return (
    <div className="selected-list">
      <ul>
        {outfits
          .filter((item) => selected[item.key])
          .map((item) => (
            <li key={item.key}>
              {item.realName} – {item.price}{" "}
              <img
                src={`/assets/currencies/${
                  item.currency === "coins" ? "coin" : "rumb"
                }.png`}
                alt={item.currency}
                className="currency-small"
              />
            </li>
          ))}
      </ul>
    </div>
  );
}

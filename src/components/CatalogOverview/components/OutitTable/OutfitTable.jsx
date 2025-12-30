import React, { useState, useMemo } from "react";

export function OutfitTable({
  outfits = [],
  selected = {},
  toggleOutfit = () => {},
  isMobile = false,
  shouldDim = () => false,
  isActive = true,
}) {
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const toggleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const columns = [
    { key: "select", label: "✓", sortable: false },
    { key: "image", label: "Изображение", sortable: false },
    { key: "name", label: "Наряд", sortable: true },
    { key: "details", label: "Элементы", sortable: false },
    { key: "designer", label: "Дизайнер", sortable: true },
    { key: "date", label: "Дата", sortable: true },
    { key: "price", label: "Цена", sortable: true },
  ];

  const sortedOutfits = useMemo(() => {
    if (!outfits) return [];
    return [...outfits].sort((a, b) => {
      if (!a || !b) return 0;

      try {
        const aDetail = a.toDetailCard();
        const bDetail = b.toDetailCard();
        let aVal, bVal;

        switch (sortColumn) {
          case "name":
            aVal = aDetail.setName || "";
            bVal = bDetail.setName || "";
            return sortDirection === "asc"
              ? aVal.localeCompare(bVal, "ru")
              : bVal.localeCompare(aVal, "ru");

          case "designer":
            aVal = aDetail.designer || "";
            bVal = bDetail.designer || "";
            return sortDirection === "asc"
              ? aVal.localeCompare(bVal, "ru")
              : bVal.localeCompare(aVal, "ru");

          case "price":
            aVal = Number(aDetail.price) || 0;
            bVal = Number(bDetail.price) || 0;
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;

          case "date":
            const [d1, m1, y1] = (aDetail.date || "01.01.1970").split(".");
            const [d2, m2, y2] = (bDetail.date || "01.01.1970").split(".");
            aVal = new Date(+y1, +m1 - 1, +d1);
            bVal = new Date(+y2, +m2 - 1, +d2);
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;

          default:
            return 0;
        }
      } catch (err) {
        console.error("Error sorting outfits:", err);
        return 0;
      }
    });
  }, [outfits, sortColumn, sortDirection]);

  if (!outfits || outfits.length === 0) {
    return (
      <div className="outfit-table-container">
        <div style={{ padding: "20px", textAlign: "center" }}>
          No outfits available
        </div>
      </div>
    );
  }

  return (
    <div className={`outfit-table-container ${isMobile ? "mobile" : ""}`}>
      <table
        className={`outfit-table ${!isActive ? "season-inactive" : ""} ${
          isMobile ? "mobile" : ""
        }`}
      >
        <thead>
          <tr>
            {columns.map((col) => {
              let arrow = " ";
              if (col.sortable) {
                arrow =
                  sortColumn === col.key
                    ? sortDirection === "asc"
                      ? "↑"
                      : "↓"
                    : "↑";
              }

              return (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  {arrow} {col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedOutfits.map((item) => {
            if (!item || !item.isValid || !item.isValid()) return null;

            let detail;
            try {
              detail = item.toDetailCard();
            } catch {
              return null;
            }

            const itemKey = item.key;

            return (
              <tr
                key={itemKey}
                className={`${selected[itemKey] ? "selected" : ""} ${
                  shouldDim(itemKey) ? "dimmed" : ""
                }`}
                onClick={() => isMobile && toggleOutfit(itemKey)}
                style={isMobile ? { cursor: "pointer" } : undefined}
              >
                <td className="col-select">
                  {!isMobile && (
                    <button
                      className={`table-toggle ${
                        selected[itemKey] ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOutfit(itemKey);
                      }}
                    >
                      {selected[itemKey] ? "✓" : ""}
                    </button>
                  )}
                </td>

                <td className="col-image">
                  <img
                    src={item.getTransparentImage()}
                    alt={detail.setName}
                    className="table-image"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </td>

                <td className="col-name">{detail.setName || "-"}</td>

                <td className="col-details">
                  {detail.details && detail.details.length > 0
                    ? detail.details.map((d, i) => (
                        <div key={i}>
                          {i + 1}. {d}
                        </div>
                      ))
                    : "-"}
                </td>

                <td className="col-designer">{detail.designer || "-"}</td>
                <td className="col-date">{detail.date || "-"}</td>

                <td className="col-price">
                  <div className="price-cell">
                    <span>{detail.price}</span>
                    <img
                      src={detail.currencyIcon}
                      alt={detail.currency}
                      className="currency-icon"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

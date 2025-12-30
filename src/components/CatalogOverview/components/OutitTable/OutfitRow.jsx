import PriceCell from "./PriceCell";
import TimesCell from "./TimesCell";
import SelectToggle from "./SelectToggle";

const OutfitRow = ({
  item,
  times,
  isSelected,
  isDimmed,
  toggleOutfit,
  isMobile,
  isActive,
  showTimes,
}) => {
  return (
    <tr
      className={`${isSelected ? "selected" : ""} ${isDimmed ? "dimmed" : ""}`}
      onClick={() => isMobile && toggleOutfit(item.key)}
      style={isMobile ? { cursor: "pointer" } : undefined}
    >
      <td className="col-select">
        <SelectToggle
          active={isSelected}
          onToggle={() => toggleOutfit(item.key)}
          isMobile={isMobile}
        />
      </td>

      <td className="col-image">
        <img src={item.src} alt={item.label} className="table-image" />
      </td>

      <td className="col-name">
        <div className="name-price-cell">
          <span className="outfit-name">{item.realName}</span>
          {isActive && (
            <PriceCell price={item.price} currency={item.currency} mobile />
          )}
        </div>
      </td>

      <td className="col-price">
        <PriceCell price={item.price} currency={item.currency} />
      </td>

      {isActive && showTimes && (
        <td className="col-times">
          <TimesCell times={times} />
        </td>
      )}
    </tr>
  );
};

export default OutfitRow;

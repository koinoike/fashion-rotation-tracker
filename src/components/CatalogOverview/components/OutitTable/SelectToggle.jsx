const SelectToggle = ({ active, onToggle, isMobile }) => {
  return (
    <button
      className={`table-toggle ${active ? "active" : ""}`}
      role="checkbox"
      aria-checked={active}
      onClick={(e) => {
        e.stopPropagation();
        if (!isMobile) onToggle();
      }}
    >
      {active ? "✓" : ""}
    </button>
  );
};

export default SelectToggle;

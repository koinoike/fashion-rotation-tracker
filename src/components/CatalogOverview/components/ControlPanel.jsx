export function ControlPanel({
  totalPrice,
  rubRange,
  selectMode,
  isSelectDropdownOpen,
  setIsSelectDropdownOpen,
  selectNone,
  selectAll,
  invertSelection,
  filterMode,
  isFilterDropdownOpen,
  setIsFilterDropdownOpen,
  setFilterMode,
  hasSelectedItems,
  currencyFilter,
  isCurrencyDropdownOpen,
  setIsCurrencyDropdownOpen,
  setCurrencyFilter,
  viewMode,
  cycleViewMode,
  hasCoins,
  hasRumbs,
  searchQuery,
  setSearchQuery,
}) {
  const selectModeConfig = {
    none: { icon: "☐", label: "Not selected" },
    all: { icon: "☑", label: "All" },
    invert: { icon: "◐", label: "Inversion" },
  };

  const filterModeConfig = {
    all: { icon: "👁️", label: "All" },
    dim: { icon: "👻", label: "Dim" },
    hide: { icon: "🙈", label: "Hide" },
  };

  const currencyFilterConfig = {
    both: { icon: "💰", label: "Both currencies", img: null },
    coins: {
      icon: null,
      label: "Coins",
      img: "/assets/currencies/coin.png",
    },
    rumb: { icon: null, label: "Rumbs", img: "/assets/currencies/rumb.png" },
  };

  const viewModeIcon = {
    carousel: "📱",
    gallery: "🖼️",
    table: "📋",
  };

  const viewModeLabel = {
    carousel: "Carousel",
    gallery: "Gallery",
    table: "Table",
  };

  return (
    <div className="control-panel">
      <div className="control-panel-left">
        {/* <span>Итого:</span> */}
        <span className="currency">
          {totalPrice.coins}
          <img
            src="/assets/currencies/coin.png"
            alt="coins"
            style={{ width: "16px", height: "16px" }}
          />
        </span>
        <div className="rub-range-wrapper">
          <span className="currency">
            {totalPrice.rumbs}
            <img
              src="/assets/currencies/rumb.png"
              alt="rumbs"
              style={{ width: "16px", height: "16px" }}
            />
          </span>
          <span className={`rub-range-text ${rubRange ? "visible" : ""}`}>
            {rubRange ? `(≈${rubRange.min}-${rubRange.max} rubles)` : "\u00A0"}
          </span>
        </div>
      </div>

      <div className="control-panel-center">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Searching..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear the search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="select-all-dropdown">
          <button
            className={`select-all-button ${
              selectMode === "all" ? "active" : ""
            }`}
            onClick={() => setIsSelectDropdownOpen(!isSelectDropdownOpen)}
          >
            <span className="select-all-icon">
              {selectModeConfig[selectMode].icon}
            </span>
            <span className="select-all-button-text">
              {selectModeConfig[selectMode].label}
            </span>
          </button>

          <div
            className={`select-all-dropdown-menu ${
              isSelectDropdownOpen ? "open" : ""
            }`}
          >
            <div
              className={`select-option ${
                selectMode === "none" ? "selected" : ""
              }`}
              onClick={() => {
                selectNone();
                setIsSelectDropdownOpen(false);
              }}
            >
              <span className="select-option-icon">☐</span>
              <div className="select-option-content">
                <div className="select-option-label">Remove selection</div>
                <div className="select-option-description">
                  Uncheck all boxes
                </div>
              </div>
            </div>
            <div
              className={`select-option ${
                selectMode === "all" ? "selected" : ""
              }`}
              onClick={() => {
                selectAll();
                setIsSelectDropdownOpen(false);
              }}
            >
              <span className="select-option-icon">☑</span>
              <div className="select-option-content">
                <div className="select-option-label">Select all</div>
                <div className="select-option-description">
                  Check all outfits
                </div>
              </div>
            </div>
            <div
              className="select-option"
              onClick={() => {
                invertSelection();
                setIsSelectDropdownOpen(false);
              }}
            >
              <span className="select-option-icon">◐</span>
              <div className="select-option-content">
                <div className="select-option-label">Invert</div>
                <div className="select-option-description">
                  Change your selection to the opposite
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="filter-dropdown">
          <button
            className={`filter-button ${filterMode !== "all" ? "active" : ""}`}
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          >
            <span className="filter-icon">
              {filterModeConfig[filterMode].icon}
            </span>
            <span className="filter-button-text">
              {filterModeConfig[filterMode].label}
            </span>
          </button>

          <div
            className={`filter-dropdown-menu ${
              isFilterDropdownOpen ? "open" : ""
            }`}
          >
            <div
              className={`filter-option ${
                filterMode === "all" ? "selected" : ""
              }`}
              onClick={() => {
                setFilterMode("all");
                setIsFilterDropdownOpen(false);
              }}
            >
              <span className="filter-option-icon">👁️</span>
              <div className="filter-option-content">
                <div className="filter-option-label">Show all</div>
              </div>
            </div>
            <div
              className={`filter-option ${
                filterMode === "dim" ? "selected" : ""
              }`}
              onClick={() => {
                setFilterMode("dim");
                setIsFilterDropdownOpen(false);
              }}
            >
              <span className="filter-option-icon">👻</span>
              <div className="filter-option-content">
                <div className="filter-option-label">Dim unselected</div>
              </div>
            </div>
            <div
              className={`filter-option ${
                filterMode === "hide" ? "selected" : ""
              } ${!hasSelectedItems ? "disabled" : ""}`}
              onClick={() => {
                if (hasSelectedItems) {
                  setFilterMode("hide");
                  setIsFilterDropdownOpen(false);
                }
              }}
              style={{
                opacity: hasSelectedItems ? 1 : 0.5,
                cursor: hasSelectedItems ? "pointer" : "not-allowed",
              }}
            >
              <span className="filter-option-icon">🙈</span>
              <div className="filter-option-content">
                <div className="filter-option-label">Hide unselected</div>
              </div>
            </div>
          </div>
        </div>

        <div className="currency-filter-dropdown">
          <button
            className={`currency-filter-button ${
              currencyFilter !== "both" ? "active" : ""
            }`}
            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
          >
            {currencyFilterConfig[currencyFilter].img ? (
              <img
                src={currencyFilterConfig[currencyFilter].img}
                alt={currencyFilter}
                className="currency-filter-icon-img"
              />
            ) : (
              <span className="currency-filter-icon">
                {currencyFilterConfig[currencyFilter].icon}
              </span>
            )}
            <span className="currency-filter-button-text">
              {currencyFilterConfig[currencyFilter].label}
            </span>
          </button>

          <div
            className={`currency-filter-dropdown-menu ${
              isCurrencyDropdownOpen ? "open" : ""
            }`}
          >
            <div
              className={`currency-filter-option ${
                currencyFilter === "both" ? "selected" : ""
              }`}
              onClick={() => {
                setCurrencyFilter("both");
                setIsCurrencyDropdownOpen(false);
              }}
            >
              <span className="currency-filter-option-icon">💰</span>
              <div className="currency-filter-option-content">
                <div className="currency-filter-option-label">
                  Both currencies
                </div>
                <div className="currency-filter-option-description">
                  Coins and rumbs
                </div>
              </div>
            </div>
            <div
              className={`currency-filter-option ${
                currencyFilter === "coins" ? "selected" : ""
              } ${!hasCoins ? "disabled" : ""}`}
              onClick={() => {
                if (hasCoins) {
                  setCurrencyFilter("coins");
                  setIsCurrencyDropdownOpen(false);
                }
              }}
              style={{
                opacity: hasCoins ? 1 : 0.5,
                cursor: hasCoins ? "pointer" : "not-allowed",
              }}
            >
              <img
                src="/assets/currencies/coin.png"
                alt="coins"
                className="currency-filter-option-icon-img"
              />
              <div className="currency-filter-option-content">
                <div className="currency-filter-option-label">Coins only</div>
                <div className="currency-filter-option-description">
                  Coins only
                </div>
              </div>
            </div>
            <div
              className={`currency-filter-option ${
                currencyFilter === "rumb" ? "selected" : ""
              } ${!hasRumbs ? "disabled" : ""}`}
              onClick={() => {
                if (hasRumbs) {
                  setCurrencyFilter("rumb");
                  setIsCurrencyDropdownOpen(false);
                }
              }}
              style={{
                opacity: hasRumbs ? 1 : 0.5,
                cursor: hasRumbs ? "pointer" : "not-allowed",
              }}
            >
              <img
                src="/assets/currencies/rumb.png"
                alt="rumbs"
                className="currency-filter-option-icon-img"
              />
              <div className="currency-filter-option-content">
                <div className="currency-filter-option-label">Rumbs only</div>
                <div className="currency-filter-option-description">
                  Rumbs only
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="control-panel-right">
        <button className="view-mode-button" onClick={cycleViewMode}>
          <span className="icon-only-mobile">{viewModeIcon[viewMode]}</span>
          <span className="text-desktop">
            {viewModeIcon[viewMode]} {viewModeLabel[viewMode]}
          </span>
        </button>
      </div>
    </div>
  );
}

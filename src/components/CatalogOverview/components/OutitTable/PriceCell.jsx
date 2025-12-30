const PriceCell = ({ price, currency, mobile = false }) => {
  return (
    <span className={mobile ? "price-mobile" : "price-cell"}>
      {price}
      <img
        src={`/assets/currencies/${currency === "coins" ? "coin" : "rumb"}.png`}
        alt={currency}
        className="currency-icon"
      />
    </span>
  );
};

export default PriceCell;

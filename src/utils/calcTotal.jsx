export function calculateTotal(prices) {
  return Object.values(prices)
    .flat()
    .reduce(
      (acc, item) => {
        const price = Number(item.price);
        if (item.currency === "coins") acc.coins += price;
        if (item.currency === "rumb") acc.rumb += price;
        return acc;
      },
      { coins: 0, rumb: 0 }
    );
}

export const getSeasonItems = (season = "winter") => {
  const seasonPath = "winter";

  return Array.from({ length: 21 }, (_, i) => ({
    id: i + 1,
    src: `/assets/transparent/${seasonPath}/${i + 1}_1.png`,
    title: `Collection nr. ${i + 1}`,
  }));
};

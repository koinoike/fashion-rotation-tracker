import fs from "fs";
import path from "path";

// ---- CONFIG ----
const season = "spring";
const baseDir = path.resolve("./");
const pricesFile = path.join(baseDir, `src/constants/prices-${season}.json`);
const podiumConfigFile = path.join(baseDir, "src/constants/podiumConfig.js");
const placementFile = path.join(baseDir, "src/constants/placementData.js");
const imagesDir = path.join(baseDir, `public/assets/transparent/${season}/`);

// ---- READ prices JSON ----
const pricesData = JSON.parse(fs.readFileSync(pricesFile, "utf-8"));
const outfitsArray = Object.entries(pricesData).map(([id, o]) => ({
  id: Number(id),
  ...o,
}));

// ---- SORT CHRONOLOGICALLY ----
outfitsArray.sort((a, b) => new Date(a.date) - new Date(b.date));

// ---- RENAME IMAGES + UPDATE prices JSON ----
const newPricesData = {};

outfitsArray.forEach((o, i) => {
  const newId = i + 1;
  const ext = path.extname(o.image) || ".png";
  const newImageName = `${newId}${ext}`;

  const oldPath = path.join(imagesDir, o.image);
  const newPath = path.join(imagesDir, newImageName);

  if (fs.existsSync(oldPath) && oldPath !== newPath) {
    fs.renameSync(oldPath, newPath);
  }

  newPricesData[newId] = {
    price: o.price,
    currency: o.currency,
    setName: o.setName,
    name: o.name,
    designer: o.designer,
    date: o.date,
    image: newImageName,
  };
});

fs.writeFileSync(pricesFile, JSON.stringify(newPricesData, null, 2));

// ---- READ EXISTING PODIUM CONFIG ----
let existingPodiumConfig = {};

if (fs.existsSync(podiumConfigFile)) {
  const content = fs.readFileSync(podiumConfigFile, "utf-8");
  const match = content.match(
    /export const COLLECTIONS_BY_PODIUM = ({[\s\S]+});/
  );
  if (match) {
    existingPodiumConfig = eval("(" + match[1] + ")");
  }
}

// ---- BUILD SPRING PODIUM CONFIG ----
const podiumConfig = { left: [], center: [], right: [] };
let coinIndex = 0;

outfitsArray.forEach((o, i) => {
  const id = i + 1;

  if (o.currency === "rumb") {
    podiumConfig.right.push(id);
  } else {
    coinIndex % 2 === 0
      ? podiumConfig.left.push(id)
      : podiumConfig.center.push(id);
    coinIndex++;
  }
});

// balance
if (podiumConfig.left.length > podiumConfig.center.length) {
  podiumConfig.right.push(podiumConfig.left.pop());
}

existingPodiumConfig[season] = podiumConfig;

fs.writeFileSync(
  podiumConfigFile,
  `export const COLLECTIONS_BY_PODIUM = ${JSON.stringify(
    existingPodiumConfig,
    null,
    2
  )};\n`
);

// ---- READ EXISTING PLACEMENT OVERRIDES ----
let existingPlacementOverrides = {};

if (fs.existsSync(placementFile)) {
  const content = fs.readFileSync(placementFile, "utf-8");
  const match = content.match(
    /export const SEASONAL_PLACEMENT_OVERRIDES = ({[\s\S]+});/
  );
  if (match) {
    existingPlacementOverrides = eval("(" + match[1] + ")");
  }
}

// ---- BUILD SPRING PLACEMENTS (DEFAULT POSITIONS) ----
const springPlacements = {};

outfitsArray.forEach((_, i) => {
  springPlacements[i + 1] = {
    positions: [
      { podiumIndex: 0, x: 17, y: 30, scale: 0.2 }, // left
      { podiumIndex: 1, x: 32, y: 15, scale: 0.2 }, // center
      { podiumIndex: 2, x: 90, y: 53, scale: 0.2 }, // right
    ],
  };
});

existingPlacementOverrides[season] = springPlacements;

// ---- WRITE placementData.js ----
fs.writeFileSync(
  placementFile,
  `export const SEASONAL_PLACEMENT_OVERRIDES = ${JSON.stringify(
    existingPlacementOverrides,
    null,
    2
  )};\n`
);

console.log("✅ Spring regenerated. Other seasons preserved.");

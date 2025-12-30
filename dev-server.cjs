// dev-server.cjs - FINAL VERSION
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
const upload = multer({ dest: path.join(__dirname, "tmp") });

// ============================================================================
// READ CONFIG
// ============================================================================
function readPodiumConfig(season) {
  const configPath = path.join(
    __dirname,
    "src",
    "constants",
    "podiumConfig.js"
  );
  if (!fs.existsSync(configPath)) return null;

  const content = fs.readFileSync(configPath, "utf-8");

  // Remove export statement to make it eval-able
  const cleanContent = content.replace(
    /export\s+const\s+COLLECTIONS_BY_PODIUM\s*=/,
    "const COLLECTIONS_BY_PODIUM ="
  );

  try {
    // Evaluate to get the object
    const COLLECTIONS_BY_PODIUM = eval(
      cleanContent + "\nCOLLECTIONS_BY_PODIUM;"
    );

    // Return the data for the requested season
    if (COLLECTIONS_BY_PODIUM[season]) {
      return {
        left: COLLECTIONS_BY_PODIUM[season].left || [],
        center: COLLECTIONS_BY_PODIUM[season].center || [],
        right: COLLECTIONS_BY_PODIUM[season].right || [],
      };
    }

    return null;
  } catch (err) {
    console.error("Error parsing podiumConfig:", err);
    return null;
  }
}

// ============================================================================
// UPDATE CONFIG (DELETE)
// ============================================================================
function updatePodiumConfig(season, deletedId) {
  const configPath = path.join(
    __dirname,
    "src",
    "constants",
    "podiumConfig.js"
  );
  if (!fs.existsSync(configPath)) return;

  let content = fs.readFileSync(configPath, "utf-8");

  const removeId = (str) =>
    str
      .replace(new RegExp(`\\b${deletedId},\\s*`, "g"), "")
      .replace(new RegExp(`,\\s*${deletedId}\\b`, "g"), "")
      .replace(new RegExp(`\\b${deletedId}\\b`, "g"), "");

  content = removeId(content);

  const backup = `\n\n// BACKUP ${new Date().toISOString()} - Deleted ID ${deletedId} from ${season}`;
  fs.writeFileSync(configPath, content + backup, "utf-8");
}

// ============================================================================
// SAVE ORDER
// ============================================================================
// Replace the savePodiumOrder function in dev-server.cjs with this fixed version:

function savePodiumOrder(season, order) {
  console.log(`\n💾 Saving order for ${season}:`, order);

  const configPath = path.join(
    __dirname,
    "src",
    "constants",
    "podiumConfig.js"
  );

  if (!fs.existsSync(configPath)) {
    throw new Error("podiumConfig.js not found");
  }

  let content = fs.readFileSync(configPath, "utf-8");
  const activeCode = content.split("// BACKUP")[0];

  const formatArray = (arr) => {
    if (!arr || arr.length === 0) return "[]";
    if (arr.length <= 10) {
      return "[" + arr.join(", ") + "]";
    }
    // Format long arrays with line breaks
    const lines = [];
    for (let i = 0; i < arr.length; i += 7) {
      lines.push("    " + arr.slice(i, i + 7).join(", "));
    }
    return "[\n" + lines.join(",\n") + "\n    ]";
  };

  let updatedContent = activeCode;

  // Process each podium for the specific season
  ["left", "center", "right"].forEach((podium) => {
    // Fixed regex pattern - matches arrays within the season's podium section
    const seasonBlockRegex = new RegExp(
      `(${season}\\s*:\\s*\\{[^}]*?${podium}\\s*:\\s*)\\[[^\\]]*?\\]`,
      "s"
    );

    const match = seasonBlockRegex.exec(updatedContent);

    if (match) {
      console.log(`✅ Found ${season}.${podium}`);
      const before = match[1]; // Everything up to and including "left: "
      const newArray = formatArray(order[podium] || []);

      // Replace this specific match
      updatedContent = updatedContent.replace(match[0], before + newArray);
    } else {
      console.log(`❌ Could not find ${season}.${podium}`);
      console.log(`   Trying alternative pattern...`);

      // Alternative pattern for different formatting
      const altPattern = new RegExp(
        `(["']?${season}["']?\\s*:\\s*\\{[^}]*?["']?${podium}["']?\\s*:\\s*)\\[[\\s\\S]*?\\]`,
        ""
      );

      const altMatch = altPattern.exec(updatedContent);
      if (altMatch) {
        console.log(`✅ Found ${season}.${podium} with alternative pattern`);
        const before = altMatch[1];
        const newArray = formatArray(order[podium] || []);
        updatedContent = updatedContent.replace(altMatch[0], before + newArray);
      } else {
        console.log(
          `❌ Alternative pattern also failed for ${season}.${podium}`
        );
      }
    }
  });

  const backup = `\n\n// BACKUP ${new Date().toISOString()} - Updated order for ${season}`;
  fs.writeFileSync(configPath, updatedContent + backup, "utf-8");
  console.log(`✅ Saved podiumConfig.js\n`);
}

// ============================================================================
// COMPACT
// ============================================================================
function compactIds(season) {
  const jsonPath = path.join(
    __dirname,
    "src",
    "constants",
    `prices-${season}.json`
  );
  if (!fs.existsSync(jsonPath))
    return { success: false, message: "JSON not found" };

  const oldData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const sorted = Object.entries(oldData).sort(
    (a, b) => parseInt(a[0]) - parseInt(b[0])
  );
  const newData = {};
  const renamed = [];

  sorted.forEach(([oldId, outfit], idx) => {
    const newId = idx + 1;
    newData[newId] = { ...outfit };

    if (outfit.image && oldId !== newId.toString()) {
      const oldPath = path.join(
        __dirname,
        "public",
        "assets",
        "transparent",
        season,
        outfit.image
      );
      const podiumIdx = (newId - 1) % 3;
      const collId = Math.ceil(newId / 3);
      const newName = `${collId}_${podiumIdx + 1}.png`;
      const newPath = path.join(
        __dirname,
        "public",
        "assets",
        "transparent",
        season,
        newName
      );

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        newData[newId].image = newName;
        renamed.push({ old: outfit.image, new: newName });
      }
    }
  });

  fs.writeFileSync(jsonPath, JSON.stringify(newData, null, 2), "utf-8");
  rebuildPodiumConfig(
    season,
    Object.keys(newData).map((id) => parseInt(id))
  );

  return {
    success: true,
    message: `Compacted ${sorted.length} outfits`,
    renamed,
  };
}

function rebuildPodiumConfig(season, newIds) {
  const configPath = path.join(
    __dirname,
    "src",
    "constants",
    "podiumConfig.js"
  );
  if (!fs.existsSync(configPath)) return;

  const left = newIds.filter((id) => (id - 1) % 3 === 0);
  const center = newIds.filter((id) => (id - 1) % 3 === 1);
  const right = newIds.filter((id) => (id - 1) % 3 === 2);

  let content = fs.readFileSync(configPath, "utf-8");
  const formatArr = (arr) => "[\n      " + arr.join(", ") + ",\n    ]";

  content = content.replace(
    new RegExp(`(${season}:\\s*\\{[^}]*?left:\\s*)\\[[^\\]]*\\]`, "s"),
    `$1${formatArr(left)}`
  );
  content = content.replace(
    new RegExp(`(${season}:\\s*\\{[^}]*?center:\\s*)\\[[^\\]]*\\]`, "s"),
    `$1${formatArr(center)}`
  );
  content = content.replace(
    new RegExp(`(${season}:\\s*\\{[^}]*?right:\\s*)\\[[^\\]]*\\]`, "s"),
    `$1${formatArr(right)}`
  );

  const backup = `\n\n// BACKUP ${new Date().toISOString()} - Compacted ${season}`;
  fs.writeFileSync(configPath, content + backup, "utf-8");
}

// ============================================================================
// PLACEMENT DATA ENDPOINTS
// ============================================================================

// GET /api/dev/placement/:season
app.get("/api/dev/placement/:season", (req, res) => {
  const { season } = req.params;
  try {
    const placementPath = path.join(
      __dirname,
      "src",
      "constants",
      "placementData.js"
    );
    if (!fs.existsSync(placementPath)) {
      return res
        .status(404)
        .json({ success: false, error: "placementData.js not found" });
    }

    let content = fs.readFileSync(placementPath, "utf-8");
    content = content.replace(
      /export\s+const\s+SEASONAL_PLACEMENT_OVERRIDES\s*=/,
      "const SEASONAL_PLACEMENT_OVERRIDES ="
    );

    const SEASONAL_PLACEMENT_OVERRIDES = eval(
      content + "\nSEASONAL_PLACEMENT_OVERRIDES;"
    );
    const placements = SEASONAL_PLACEMENT_OVERRIDES[season] || {};

    res.json({ success: true, season, placements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/dev/placement/:season
app.post("/api/dev/placement/:season", (req, res) => {
  const { season } = req.params;
  const { collectionId, positions, placements } = req.body;

  try {
    const placementPath = path.join(
      __dirname,
      "src",
      "constants",
      "placementData.js"
    );

    if (!fs.existsSync(placementPath)) {
      return res
        .status(404)
        .json({ success: false, error: "placementData.js not found" });
    }

    // 1. Read existing file
    let content = fs.readFileSync(placementPath, "utf-8");

    // 2. Convert 'export const' to something eval-able
    content = content.replace(
      /export\s+const\s+SEASONAL_PLACEMENT_OVERRIDES\s*=/,
      "const SEASONAL_PLACEMENT_OVERRIDES ="
    );

    // 3. Get the current object state
    const SEASONAL_PLACEMENT_OVERRIDES = eval(
      content + "\nSEASONAL_PLACEMENT_OVERRIDES;"
    );

    // ✅ SCENARIO 1: Full placements object (from PlacementEditor CRUD panel)
    if (placements) {
      console.log(`📝 Saving full placements for ${season}`);
      SEASONAL_PLACEMENT_OVERRIDES[season] = placements;
    }

    // ✅ SCENARIO 2: Individual collection (from CarouselImage devMode)
    else if (collectionId != null && positions && Array.isArray(positions)) {
      console.log(
        `\n📝 Saving positions for ${season} collection ${collectionId}`
      );

      if (!SEASONAL_PLACEMENT_OVERRIDES[season]) {
        SEASONAL_PLACEMENT_OVERRIDES[season] = {};
      }

      // 4. Sanitize and Deep Copy positions
      // Using .map() here creates a brand new array and new objects,
      // breaking any references to other collections in memory.
      const sanitizedPositions = positions.map((pos, i) => {
        const xVal = parseFloat(pos.x) || 0;
        const yVal = parseFloat(pos.y) || 0;
        const sVal =
          pos.scale != null && !isNaN(pos.scale) ? parseFloat(pos.scale) : 0.2;

        console.log(
          `  [Podium ${i}]: x=${xVal.toFixed(2)}, y=${yVal.toFixed(
            2
          )}, scale=${sVal.toFixed(3)}`
        );

        return {
          podiumIndex: i,
          x: Number(xVal.toFixed(2)),
          y: Number(yVal.toFixed(2)),
          scale: Number(sVal.toFixed(3)),
        };
      });

      // Assign to the specific collection ID
      SEASONAL_PLACEMENT_OVERRIDES[season][collectionId] = {
        positions: sanitizedPositions,
      };

      console.log(`✅ Memory updated for ${season}/${collectionId}`);
    } else {
      return res.status(400).json({
        success: false,
        error:
          "Invalid request: need either 'placements' or 'collectionId' + 'positions'",
      });
    }

    // 5. Stringify and write back to file
    const newContent =
      "export const SEASONAL_PLACEMENT_OVERRIDES = " +
      JSON.stringify(SEASONAL_PLACEMENT_OVERRIDES, null, 2) +
      ";\n";

    fs.writeFileSync(placementPath, newContent, "utf-8");
    console.log(`💾 File written successfully: placementData.js`);

    res.json({
      success: true,
      message: collectionId
        ? `Placement for collection ${collectionId} updated`
        : `Placement data for ${season} updated`,
      savedData: collectionId
        ? SEASONAL_PLACEMENT_OVERRIDES[season][collectionId]
        : SEASONAL_PLACEMENT_OVERRIDES[season],
    });
  } catch (err) {
    console.error("❌ Placement save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// OUTFIT CRUD ENDPOINTS
// ============================================================================
app.get("/api/dev/config/:season", (req, res) => {
  try {
    const config = readPodiumConfig(req.params.season);
    if (!config)
      return res
        .status(404)
        .json({ success: false, error: "Config not found" });
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/dev/prices/:season", (req, res) => {
  try {
    const jsonPath = path.join(
      __dirname,
      "src",
      "constants",
      `prices-${req.params.season}.json`
    );
    if (!fs.existsSync(jsonPath)) return res.json({});
    res.json(JSON.parse(fs.readFileSync(jsonPath, "utf-8")));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/dev/outfit/:season/:outfitId", (req, res) => {
  try {
    const { season, outfitId } = req.params;
    const jsonPath = path.join(
      __dirname,
      "src",
      "constants",
      `prices-${season}.json`
    );
    const pricesData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    if (!pricesData[outfitId]) throw new Error("Not found");

    const outfit = pricesData[outfitId];
    const sourcePath = path.join(
      __dirname,
      "public",
      "assets",
      "transparent",
      season,
      outfit.image
    );
    const deprecatedDir = path.join(
      __dirname,
      "public",
      "assets",
      "deprecated",
      season
    );
    const deprecatedPath = path.join(deprecatedDir, outfit.image);

    if (!fs.existsSync(deprecatedDir))
      fs.mkdirSync(deprecatedDir, { recursive: true });
    if (fs.existsSync(sourcePath)) fs.renameSync(sourcePath, deprecatedPath);

    fs.appendFileSync(
      path.join(deprecatedDir, "DELETED.log"),
      `${new Date().toISOString()} - ID ${outfitId}\n`
    );
    delete pricesData[outfitId];
    fs.writeFileSync(jsonPath, JSON.stringify(pricesData, null, 2), "utf-8");
    updatePodiumConfig(season, outfitId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/dev/order/:season", (req, res) => {
  try {
    const { season } = req.params;
    const { order } = req.body;
    if (!order || !order.left || !order.center || !order.right)
      throw new Error("Invalid order");
    savePodiumOrder(season, order);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/dev/compact/:season", (req, res) => {
  try {
    res.json(compactIds(req.params.season));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/dev/outfit/:season/:id", upload.single("image"), (req, res) => {
  try {
    console.log(
      `\n📤 Upload request for season=${req.params.season} id=${req.params.id}`
    );
    console.log("Body:", req.body);
    console.log("File:", req.file ? req.file.originalname : "NO FILE");

    const { season, id } = req.params;
    const jsonPath = path.join(
      __dirname,
      "src",
      "constants",
      `prices-${season}.json`
    );

    let data = {};
    if (fs.existsSync(jsonPath)) {
      data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    }

    const { setName, price, currency, name, designer, date, podium } = req.body;

    let parsedName = [];
    if (name) {
      try {
        parsedName = JSON.parse(name);
      } catch (e) {
        console.error("Failed to parse name:", e);
        parsedName = [name];
      }
    }

    let imageName = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname) || ".png";
      imageName = `${id}${ext}`;

      const destDir = path.join(
        __dirname,
        "public",
        "assets",
        "transparent",
        season
      );

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      const destPath = path.join(destDir, imageName);
      fs.renameSync(req.file.path, destPath);
      console.log(`✅ Image saved: ${destPath}`);
    } else {
      console.log("⚠️ No image file uploaded");
    }

    data[id] = {
      image: imageName || data[id]?.image, // ← keep old image if no new file
      setName: setName || "",
      price: price || "0",
      currency: currency || "coins",
      name: parsedName,
      designer: designer || "",
      date: date || new Date().toISOString().split("T")[0],
    };

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ JSON updated: ${jsonPath}`);

    res.json({ success: true, outfitId: id, imageName: imageName });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// UPDATE FULL OUTFIT DATA
// ============================================================================
app.post(
  "/api/dev/outfit/details/:season/:id",
  upload.single("image"),
  (req, res) => {
    try {
      const { season, id } = req.params;
      const jsonPath = path.join(
        __dirname,
        "src",
        "constants",
        `prices-${season}.json`
      );

      if (!fs.existsSync(jsonPath)) {
        return res.status(404).json({
          success: false,
          error: `Prices JSON not found for ${season}`,
        });
      }

      const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

      if (!data[id]) {
        return res
          .status(404)
          .json({ success: false, error: `Outfit ID ${id} not found` });
      }

      const { setName, price, currency, name, designer, date } = req.body;

      let parsedName = [];
      if (name) {
        try {
          parsedName = JSON.parse(name);
        } catch (e) {
          parsedName = Array.isArray(name) ? name : [name];
        }
      }

      let imageName = data[id].image;
      if (req.file) {
        const ext = path.extname(req.file.originalname) || ".png";
        imageName = `${id}${ext}`;
        const destDir = path.join(
          __dirname,
          "public",
          "assets",
          "transparent",
          season
        );
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        const destPath = path.join(destDir, imageName);
        fs.renameSync(req.file.path, destPath);
      }

      data[id] = {
        image: imageName,
        setName: setName || "",
        price: price || "0",
        currency: currency || "coins",
        name: parsedName,
        designer: designer || "",
        date: date || new Date().toISOString().split("T")[0],
      };

      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");

      res.json({ success: true, outfitId: id, outfit: data[id] });
    } catch (err) {
      console.error("❌ Update outfit error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ============================================================================
// COLLECTION CONFIG
// ============================================================================
const collectionNumberPath = path.join(
  __dirname,
  "src",
  "constants",
  "collectionNumber.js"
);

app.get("/api/dev/collections", (req, res) => {
  try {
    if (!fs.existsSync(collectionNumberPath))
      return res.json({ success: true, seasonConfig: {} });

    delete require.cache[require.resolve(collectionNumberPath)];
    const seasonConfig = require(collectionNumberPath).seasonConfig;
    res.json({ success: true, seasonConfig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/dev/collections/:season", (req, res) => {
  try {
    const { season } = req.params;
    const { totalCollections, layersPerCollection } = req.body;

    let seasonConfig = {};
    if (fs.existsSync(collectionNumberPath)) {
      delete require.cache[require.resolve(collectionNumberPath)];
      seasonConfig = require(collectionNumberPath).seasonConfig;
    }

    seasonConfig[season] = {
      totalCollections:
        totalCollections ?? seasonConfig[season]?.totalCollections ?? 0,
      layersPerCollection:
        layersPerCollection ?? seasonConfig[season]?.layersPerCollection ?? 3,
    };

    const content = `export const seasonConfig = ${JSON.stringify(
      seasonConfig,
      null,
      2
    )};\n`;
    fs.writeFileSync(collectionNumberPath, content, "utf-8");

    res.json({ success: true, seasonConfig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// HEALTH
// ============================================================================
app.get("/api/dev/health", (req, res) => {
  res.json({ status: "ok", phase: "Complete with Placement Editor!" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 DEV SERVER - http://localhost:${PORT}`);
  console.log(`✅ Outfit CRUD ready`);
  console.log(`✅ Placement Editor ready`);
  console.log(`✅ All systems go!\n`);
});

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down...\n");
  process.exit(0);
});

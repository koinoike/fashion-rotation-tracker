import { getNext3Times, currentIndex } from "../src/utils/timeUtils.js";
import {
  getTotalCollections,
  MANUAL_SEASON,
} from "../src/constants/seasonConfig.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { index, tz = "Europe/Moscow", season = MANUAL_SEASON } = req.query;

  try {
    const total = getTotalCollections(season);
    const collectionIndex = index ? parseInt(index) : currentIndex(total);

    const times = getNext3Times(collectionIndex, tz, total);

    res.status(200).json({
      success: true,
      collection: collectionIndex,
      times,
      timezone: tz,
      season: season,
      totalCollections: total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

import { currentIndex } from "../src/utils/timeUtils.js";
import {
  getTotalCollections,
  MANUAL_SEASON,
} from "../src/constants/seasonConfig.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { season = MANUAL_SEASON } = req.query;

  try {
    const total = getTotalCollections(season);
    const current = currentIndex(total);

    res.status(200).json({
      success: true,
      currentCollection: current,
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

import { useState, useEffect } from "react";
import {
  currentIndex,
  getCountdown,
  formatCountdownSec,
} from "../utils/timeUtils";

export function useCollectionTimer(total, devMode = false) {
  const [liveIndex, setLiveIndex] = useState(() => currentIndex(total));
  const [countdown, setCountdown] = useState(() =>
    formatCountdownSec(getCountdown())
  );

  // Пересчитываем liveIndex при изменении total
  useEffect(() => {
    setLiveIndex(currentIndex(total));
    setCountdown(formatCountdownSec(getCountdown()));
  }, [total]);

  //if not dev mode - refresh every second (because of the timer)
  useEffect(() => {
    // if (devMode) {
    //   console.log("⏱️ Timer paused in dev mode");
    //   return;
    // }

    const interval = setInterval(() => {
      const newIndex = currentIndex(total);
      const newCountdown = formatCountdownSec(getCountdown());
      setLiveIndex(newIndex);
      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [total, devMode]); // ← Добавили devMode в зависимости!

  return { liveIndex, countdown };
}

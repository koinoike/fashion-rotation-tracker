import { INTERVAL, START_DATE, START_COLLECTION } from "../constants/config.js";

export function currentIndex(total) {
  const now = new Date();
  const diffMs = now - START_DATE;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const intervalsPassed = Math.floor(diffMinutes / INTERVAL);
  let collectionNumber = ((START_COLLECTION - 1 + intervalsPassed) % total) + 1;
  if (collectionNumber <= 0) collectionNumber += total;
  return collectionNumber;
}

export function getCountdown() {
  const now = new Date();
  const diffMs = now - START_DATE;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const minutesIntoInterval = diffMinutes % INTERVAL;
  const secondsIntoMinute = Math.floor((diffMs % (60 * 1000)) / 1000);
  const minutesToNext = INTERVAL - minutesIntoInterval - 1;
  const secondsToNext = 60 - secondsIntoMinute;
  return minutesToNext * 60 + secondsToNext;
}

export function formatCountdownSec(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getNext3Times(collectionNum, tz, total) {
  const now = new Date();
  const diffMs = now - START_DATE;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const intervalsPassed = Math.floor(diffMinutes / INTERVAL);
  const currentCollection =
    ((START_COLLECTION - 1 + intervalsPassed) % total) + 1;

  const times = [];
  for (let occurrence = 0; occurrence < 3; occurrence++) {
    let intervalsUntilCollection;

    if (occurrence === 0) {
      if (collectionNum > currentCollection) {
        intervalsUntilCollection = collectionNum - currentCollection;
      } else if (collectionNum < currentCollection) {
        intervalsUntilCollection = total - currentCollection + collectionNum;
      } else {
        intervalsUntilCollection = 0;
      }
    } else {
      // ✅ ИСПРАВЛЕНИЕ: для следующих появлений просто добавляем полный цикл
      if (collectionNum >= currentCollection) {
        intervalsUntilCollection =
          collectionNum - currentCollection + occurrence * total;
      } else {
        intervalsUntilCollection =
          total - currentCollection + collectionNum + occurrence * total;
      }
    }

    const msIntoInterval = diffMs % (INTERVAL * 60 * 1000);
    const startTime = new Date(
      now.getTime() +
        intervalsUntilCollection * INTERVAL * 60 * 1000 -
        msIntoInterval
    );
    const endTime = new Date(startTime.getTime() + INTERVAL * 60 * 1000);

    const formatTime = (date) =>
      new Intl.DateTimeFormat("ru-RU", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);

    times.push({
      start: formatTime(startTime),
      end: formatTime(endTime),
    });
  }
  return times;
}

export function getNextWeekTimes(collectionNum, tz, total) {
  const now = new Date();
  const diffMs = now - START_DATE;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const intervalsPassed = Math.floor(diffMinutes / INTERVAL);
  const currentCollection =
    ((START_COLLECTION - 1 + intervalsPassed) % total) + 1;

  const times = [];
  const totalIntervals = Math.ceil((7 * 24 * 60) / INTERVAL); // на неделю вперед

  for (let i = 0; i < totalIntervals; i++) {
    const nextCollectionNumber = ((currentCollection - 1 + i) % total) + 1;

    if (nextCollectionNumber !== collectionNum) continue;

    const msIntoInterval = diffMs % (INTERVAL * 60 * 1000);
    const startTime = new Date(
      now.getTime() + i * INTERVAL * 60 * 1000 - msIntoInterval
    );
    const endTime = new Date(startTime.getTime() + INTERVAL * 60 * 1000);

    const formatTime = (date) =>
      new Intl.DateTimeFormat("ru-RU", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }).format(date);

    times.push({
      start: formatTime(startTime),
      end: formatTime(endTime),
    });
  }

  return times;
}

// Новая функция вместо getNext3Times для N интервалов
export function getNextNTimes(collectionNum, tz, total, count) {
  const now = new Date();
  const diffMs = now - START_DATE;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const intervalsPassed = Math.floor(diffMinutes / INTERVAL);
  const currentCollection =
    ((START_COLLECTION - 1 + intervalsPassed) % total) + 1;

  const times = [];
  for (let occurrence = 0; occurrence < count; occurrence++) {
    let intervalsUntilCollection;

    if (occurrence === 0) {
      if (collectionNum > currentCollection) {
        intervalsUntilCollection = collectionNum - currentCollection;
      } else if (collectionNum < currentCollection) {
        intervalsUntilCollection = total - currentCollection + collectionNum;
      } else {
        intervalsUntilCollection = 0;
      }
    } else {
      const firstOccurrence =
        collectionNum > currentCollection
          ? collectionNum - currentCollection
          : total - currentCollection + collectionNum;
      intervalsUntilCollection = firstOccurrence + occurrence * total;
    }

    const minutesToStart =
      intervalsUntilCollection * INTERVAL - (diffMinutes % INTERVAL);
    const startTime = new Date(now.getTime() + minutesToStart * 60 * 1000);
    const endTime = new Date(startTime.getTime() + INTERVAL * 60 * 1000 - 1000);

    const formatTime = (date) =>
      new Intl.DateTimeFormat("ru-RU", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);

    times.push({
      start: formatTime(startTime),
      end: formatTime(endTime),
    });
  }
  return times;
}

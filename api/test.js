export default function handler(req, res) {
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
    ,
  ];
  const dayName = days[now.getDay()];

  res.status(200).json({
    success: true,
    message: "API is working! 🎉",
    dayOfWeek: dayName,
    date: now.toISOString(),
    timestamp: now.getTime(),
  });
}

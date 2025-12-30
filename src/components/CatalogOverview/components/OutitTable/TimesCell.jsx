const TimesCell = ({ times = [] }) => {
  return (
    <div className="times-cell">
      {times.map((t, idx) => (
        <div key={idx} className="time-slot">
          <span className="time-number">{idx + 1}.</span>
          <span className="time-range">
            {t.start} – {t.end}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TimesCell;

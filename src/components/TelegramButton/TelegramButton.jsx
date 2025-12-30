import React from "react";
import "./TelegramButton.css";

export default function TelegramButton({
  text = "developer",
  variant = "default",
}) {
  return (
    <a
      href="https://t.me/"
      target="_blank"
      rel="noopener noreferrer"
      className={`telegram-button telegram-button--${variant}`}
      title="Developer"
    >
      {variant !== "icon-only" && <span>{text}</span>}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 240"
        fill="currentColor"
        className="telegram-icon"
      >
        <path d="M120 0C53.73 0 0 53.73 0 120s53.73 120 120 120 120-53.73 120-120S186.27 0 120 0zm57.25 86.11l-21.63 102.35c-1.63 7.23-5.88 9.03-11.89 5.62l-32.86-24.22-15.86 15.28c-1.76 1.76-3.23 3.23-6.64 3.23l2.38-33.59 61.13-55.15c2.66-2.38-.58-3.71-4.12-1.33L87.27 125.6 57.7 115.4c-7.42-2.38-7.54-7.42 1.57-11.01l112.15-43.07c5.18-1.94 9.73 1.33 8.83 11.79z" />
      </svg>
    </a>
  );
}

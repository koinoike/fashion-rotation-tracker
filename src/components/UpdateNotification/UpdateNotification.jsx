import React from "react";
import "./UpdateNotification.css";

export default function UpdateNotification({ isOpen, onClose, warningText }) {
  if (!isOpen) return null;

  return (
    <div className="update-notification-overlay" onClick={onClose}>
      <div
        className="update-notification-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Optional warning */}
        {warningText && (
          <div className="notification-warning">
            <span className="warning-icon">⚠️</span>
            <h2>{warningText}</h2>
          </div>
        )}

        <div className="notification-icon">🎨</div>

        <div className="notification-title">
          <h3>Все зимние и весенние наряды доступны на сайте!</h3>
          {/* <ul className="notification-list">
            <li>Все даты появления зимних нарядов</li>
            <li>4 цветовые темы для разных времён года</li>
            <li>Возможность изменять часовой пояс</li>
          </ul> */}
        </div>

        <p className="notification-description">
          Learn about the updates on the developer's channel!
        </p>

        <div className="notification-actions">
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="notification-button telegram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 240 240"
              fill="currentColor"
              className="telegram-icon"
            >
              <path d="M120 0C53.73 0 0 53.73 0 120s53.73 120 120 120 120-53.73 120-120S186.27 0 120 0zm57.25 86.11l-21.63 102.35c-1.63 7.23-5.88 9.03-11.89 5.62l-32.86-24.22-15.86 15.28c-1.76 1.76-3.23 3.23-6.64 3.23l2.38-33.59 61.13-55.15c2.66-2.38-.58-3.71-4.12-1.33L87.27 125.6 57.7 115.4c-7.42-2.38-7.54-7.42 1.57-11.01l112.15-43.07c5.18-1.94 9.73 1.33 8.83 11.79z" />
            </svg>
            <span className="button-text">Developer</span>
          </a>
        </div>

        <button className="dismiss-button" onClick={onClose}>
          Next
        </button>
      </div>
    </div>
  );
}

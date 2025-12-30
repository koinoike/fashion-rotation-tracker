import React from "react";
import { PriceDisplay } from "../../utils/priceUtils";
import TelegramButton from "../TelegramButton/TelegramButton";
import "./Footer.css";

export default function Footer({ interval }) {
  return (
    <div className="footer">
      <p>
        This is an unofficial fan site for the game. The collection
        automatically changes every {interval} minutes. The data is up to date
        as of December 23, 2025. The site may collect anonymous data for
        analytics to improve your experience.
        {/* <TelegramButton variant="footer" text="Developer" /> © 2025 */}
      </p>
    </div>
  );
}

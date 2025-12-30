import React, { useRef } from "react";
import { outfitService } from "../../domain/outfit/outfitService";
import ImageDownloader from "../ImageDownloader/ImageDownloader";
import "./ItemDetail.css";

export default function ItemDetail({
  outfit,
  showDownload = true,
  standalone = false,
  hasCalculatorAfter = false,
}) {
  const cardRef = useRef(null);

  if (!outfit || !outfit.isValid()) {
    return null;
  }

  const detail = outfit.toDetailCard();
  const filename = outfitService.generateFilename(outfit);

  const wrapperClass = standalone
    ? "item-detail item-detail-standalone"
    : hasCalculatorAfter
    ? "item-detail has-calculator-after"
    : "item-detail";

  return (
    <div className={wrapperClass} ref={cardRef}>
      {showDownload && (
        <div className="image-downloader-wrapper">
          <ImageDownloader
            filename={filename}
            targetRef={cardRef}
            includeWatermark
          />
        </div>
      )}

      <div className="item-detail-content">
        <div className="item-detail-image">
          {detail.image && (
            <img
              src={detail.image}
              alt={detail.setName}
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>

        <div className="item-detail-info">
          <h3 className="item-detail-title">{detail.setName}</h3>

          <div className="item-detail-price-wrapper">
            <div className="item-detail-price">
              <span className="price-amount">{detail.price}</span>
              <img
                src={detail.currencyIcon}
                alt={detail.currency}
                className="currency-icon"
              />
            </div>
          </div>

          <div className="item-detail-list">
            {/* ✅ Regular detail items */}
            {detail.details.map((line, i) => (
              <div key={i} className="item-detail-item">
                {line}
              </div>
            ))}

            {/* ✅ Metadata items with special styling */}
            {detail.designer && (
              <div className="item-detail-item metadata">
                Designer: {detail.designer}
              </div>
            )}

            {detail.date && (
              <div className="item-detail-item metadata">
                Added on: {detail.date}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Watermark hidden in UI, shown only when exporting PNG */}
      <div className="item-watermark" style={{ display: "none" }}>
        <svg
          className="item-watermark-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 240 240"
          aria-hidden="true"
        >
          <path d="M120 0C53.73 0 0 53.73 0 120s53.73 120 120 120 120-53.73 120-120S186.27 0 120 0zm57.25 86.11l-21.63 102.35c-1.63 7.23-5.88 9.03-11.89 5.62l-32.86-24.22-15.86 15.28c-1.76 1.76-3.23 3.23-6.64 3.23l2.38-33.59 61.13-55.15c2.66-2.38-.58-3.71-4.12-1.33L87.27 125.6 57.7 115.4c-7.42-2.38-7.54-7.42 1.57-11.01l112.15-43.07c5.18-1.94 9.73 1.33 8.83 11.79z" />
        </svg>
      </div>
    </div>
  );
}

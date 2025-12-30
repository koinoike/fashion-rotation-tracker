import React, { useState } from "react";
import html2canvas from "html2canvas";
import { PNG_EXPORT_WIDTH, PNG_EXPORT_HEIGHT } from "../../constants/config";
import "./ImageDownloader.css";

export default function ImageDownloader({
  targetRef,
  filename = "image.png",
  includeWatermark,
}) {
  const [isRendering, setIsRendering] = useState(false);

  const handleDownload = async () => {
    if (!targetRef?.current || isRendering) return;
    setIsRendering(true);

    const element = targetRef.current;

    // Hide download button
    const downloadButton = element.querySelector(".image-downloader-wrapper");
    if (downloadButton) downloadButton.style.visibility = "hidden";

    // Show watermark only for PNG
    const watermark = element.querySelector(".item-watermark");
    if (includeWatermark && watermark) watermark.style.display = "flex";

    // Store original styles
    const originalWidth = element.style.width;
    const originalHeight = element.style.height;
    const originalMaxWidth = element.style.maxWidth;
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;
    const originalBoxSizing = element.style.boxSizing;

    // Force mobile layout by adding a class
    element.classList.add("export-mode");

    // Force exact export dimensions and prevent overflow
    element.style.width = `${PNG_EXPORT_WIDTH}px`;
    element.style.height = `${PNG_EXPORT_HEIGHT}px`;
    element.style.maxWidth = `${PNG_EXPORT_WIDTH}px`;
    element.style.maxHeight = `${PNG_EXPORT_HEIGHT}px`;
    element.style.overflow = "hidden";
    element.style.boxSizing = "border-box";

    // Wait for layout to settle
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 1,
        width: PNG_EXPORT_WIDTH,
        height: PNG_EXPORT_HEIGHT,
        windowWidth: PNG_EXPORT_WIDTH,
        windowHeight: PNG_EXPORT_HEIGHT,
        useCORS: true,
        allowTaint: false,
        logging: false,
        x: 0,
        y: 0,
      });

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      // Restore original styles
      element.classList.remove("export-mode");
      element.style.width = originalWidth;
      element.style.height = originalHeight;
      element.style.maxWidth = originalMaxWidth;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
      element.style.boxSizing = originalBoxSizing;

      if (downloadButton) downloadButton.style.visibility = "visible";
      if (watermark) watermark.style.display = "none";
      setIsRendering(false);
    }
  };

  return (
    <button
      className="image-downloader-btn"
      onClick={handleDownload}
      disabled={isRendering}
      title="Скачать как PNG"
      aria-label="Скачать изображение"
    >
      <svg
        className="download-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  );
}

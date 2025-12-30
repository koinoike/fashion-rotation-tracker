import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Analytics } from "@vercel/analytics/react";
// import Clarity from "@microsoft/clarity";
// import ReactGA from "react-ga4";

// Clarity.init("yourKey");
// ReactGA.initialize("yourKey");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);

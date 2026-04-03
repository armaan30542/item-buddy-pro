import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadSeedIfNeeded } from "./lib/local-store";

// Restore theme preference
const saved = localStorage.getItem("theme");
if (saved === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

// Load seed data on first run, then render
loadSeedIfNeeded().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

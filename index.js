import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import backend from "./backend/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// API
app.use("/api", backend);

// Fix MIME type for Vite ES modules (xcloud issue)
app.use((req, res, next) => {
  if (req.path.endsWith(".js")) {
    res.type("application/javascript");
  }
  next();
});

// Serve Vite build
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback LAST
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

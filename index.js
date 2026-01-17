// Optionally load .env for local dev; ignore if dotenv is missing in prod
try {
  await import("dotenv/config");
} catch (err) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("dotenv not available; relying on existing env vars");
  }
}
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import backend from "./backend/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes FIRST
app.use("/api", backend);

// Explicit API 404 to prevent SPA fallback for unknown API paths
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Serve static frontend files from dist
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback: serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 5001;
const HOST = "0.0.0.0"; // bind all interfaces for cloud hosts

app.listen(PORT, HOST, () => {
  console.log(`***************************\nBACKEND: ${PORT} 🙌`);
  console.log("\nDB Config at startup:");
  console.log("HOST:", process.env.DB_HOST);
  console.log("PORT:", process.env.DB_PORT || 3306);
  console.log("USER:", process.env.DB_USER);
  console.log("PASSWORD:", process.env.DB_PASS ? "****" : null);
  console.log("DATABASE:", process.env.DB_NAME);
});

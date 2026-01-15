import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import backend from "./backend/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static frontend files from dist
app.use(express.static(path.join(__dirname, "dist")));

// API routes
app.use("/api", backend);

// SPA fallback: serve index.html for all other routes (after static & API)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`***************************\nBACKEND: ${PORT} 🙌`);
  console.log("\nDB Config at startup:");
  console.log("HOST:", process.env.DB_HOST);
  console.log("PORT:", process.env.DB_PORT || 3306);
  console.log("USER:", process.env.DB_USER);
  console.log("PASSWORD:", process.env.DB_PASS ? "****" : null);
  console.log("DATABASE:", process.env.DB_NAME);
});

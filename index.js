import "dotenv/config"; // loads .env
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import backend from "./backend/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve backend routes
app.use("/api", backend);

// Serve Vite frontend build
app.use(express.static(path.join(__dirname, "dist")));

// Fallback to index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(express.static(path.join(__dirname, "/dist")));

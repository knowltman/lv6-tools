// ...existing code...
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import backend from "./backend/server.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS: Only allow trusted origins and log rejections
const allowedOrigins = [];
if (process.env.VITE_CLIENT_URL)
  allowedOrigins.push(process.env.VITE_CLIENT_URL);
allowedOrigins.push("http://localhost:5173"); // dev
allowedOrigins.push("http://localhost:5001"); // direct backend

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server or curl
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("Blocked CORS origin:", origin);
      return callback(new Error("CORS: Not allowed by policy"), false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// API routes FIRST
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});
app.use("/api", backend);

// Explicit API 404 to prevent SPA fallback for unknown API paths
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

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

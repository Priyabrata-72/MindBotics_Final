import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import allRoutes from "./routes/AllRoute.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
// const HOST = "0.0.0.0";
app.use(
  cors({
    // origin: true, // allows localhost + LAN IP frontend
    origin: [
      "http://localhost:8080",
      "https://mind-botics.onrender.com",
      "https://www.mindbotics.in",
      "https://mindbotics.in"
    ],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Server is running fine");
});

app.use("/", allRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api", contactRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`Error [${req.method} ${req.url}]: ${err.message}`);

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// app.listen(PORT, HOST, () => {
//   console.log(`Server running on http://192.168.1.14:${PORT}`);
// });
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
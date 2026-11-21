
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.route.js";
import complaintRoutes from "./routes/complaint.route.js";
import officerRoutes from "./routes/officer.route.js";
import notificationRoutes from "./routes/notification.route.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded complaint images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Complaint routes
app.use("/api/complaints", complaintRoutes);

// Officer routes
app.use("/api/officer", officerRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Drainage Management API is running"
  });
});

export default app;

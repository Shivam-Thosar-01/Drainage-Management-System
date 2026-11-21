
import express from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";

import {
  verifyToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// All notification routes require citizen authentication
router.use(verifyToken, authorizeRole("citizen"));

// Get all notifications
router.get("/", getMyNotifications);

// Mark all notifications as read
router.patch("/mark-all-read", markAllNotificationsAsRead);

// Mark one notification as read
router.patch("/:notificationId/read", markNotificationAsRead);

export default router;

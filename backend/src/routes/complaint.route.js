
import express from "express";

import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
} from "../controllers/complaint.controller.js";

import {
  verifyToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Citizen routes
router.post(
  "/create",
  verifyToken,
  authorizeRole("citizen"),
  upload.single("image"),
  createComplaint
);

router.get(
  "/my-complaints",
  verifyToken,
  authorizeRole("citizen"),
  getMyComplaints
);

router.get(
  "/:complaintId",
  verifyToken,
  authorizeRole("citizen"),
  getComplaintById
);

export default router;

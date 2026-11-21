
import express from "express";

import {
  getAssignedComplaints,
  updateComplaint,
} from "../controllers/officer.controller.js";

import {
  verifyToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only approved officers can access these routes
router.use(verifyToken, authorizeRole("officer"));

// Get complaints assigned to this officer
router.get("/complaints", getAssignedComplaints);

// Update a particular complaint
router.patch("/complaints/:complaintId", updateComplaint);

export default router;


import express from "express";

import {
  createArea,
  getAreas,
  getPendingOfficers,
  approveOfficer,
  getComplaintAnalytics,
} from "../controllers/admin.controller.js";

import {
  verifyToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken, authorizeRole("admin"));

// Area management
router.post("/areas", createArea);
router.get("/areas", getAreas);

// Officer management
router.get("/pending-officers", getPendingOfficers);
router.patch("/approve-officer/:officerId", approveOfficer);

// Complaint analytics
router.get("/analytics", getComplaintAnalytics);

export default router;

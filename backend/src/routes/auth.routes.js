import express from "express";

import {
  signup,
  login,
  getCurrentUser,
  logout,
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Get logged-in user
router.get("/me", verifyToken, getCurrentUser);

// Logout user
router.post("/logout", verifyToken, logout);

export default router;

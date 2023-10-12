import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserShippingAddress,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/update/shipping", isAuthenticated, updateUserShippingAddress);

export default router;

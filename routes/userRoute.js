import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserShippingAddress,
  deleteUserShippingAddress,
  getAllUsers,
  updateUserType,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/update/shipping", isAuthenticated, updateUserShippingAddress);
router.delete("/shipping/:id", isAuthenticated, deleteUserShippingAddress);
router.get("/", isAuthenticated, getAllUsers);
router.put("/update/type/:id", isAuthenticated, updateUserType);
export default router;

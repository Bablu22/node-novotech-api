import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
} from "../controllers/orderController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import express from "express";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", isAuthenticated, createOrder);
router.get("/", isAuthenticated, getOrders);
router.get("/stats", isAuthenticated, isAdmin, getOrderStats);
router.put("/update/:id", isAuthenticated, isAdmin, updateOrderStatus);
router.get("/:id", isAuthenticated, getOrderById);

export default router;

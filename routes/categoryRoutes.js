import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", isAuthenticated, isAdmin, updateCategory);
router.delete("/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", isAuthenticated, isAdmin, updateProduct);
router.delete("/:id", isAuthenticated, isAdmin, deleteProduct);

export default router;

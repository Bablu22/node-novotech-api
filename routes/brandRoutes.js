import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, createBrand);
router.get("/", getBrands);
router.get("/:id", getBrandById);
router.put("/:id", isAuthenticated, isAdmin, updateBrand);
router.delete("/:id", isAuthenticated, isAdmin, deleteBrand);

export default router;

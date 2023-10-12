import {
  createColor,
  getColors,
  getColorById,
  updateColor,
  deleteColor,
} from "../controllers/colorController.js";
import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/").post(isAuthenticated, isAdmin, createColor).get(getColors);
router
  .route("/:id")
  .get(getColorById)
  .put(isAuthenticated, isAdmin, updateColor)
  .delete(isAuthenticated, isAdmin, deleteColor);

export default router;

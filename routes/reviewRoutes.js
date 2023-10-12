import { createReview } from "../controllers/reviewController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import express from "express";

const router = express.Router();

router.route("/:id").post(isAuthenticated, createReview);

export default router;

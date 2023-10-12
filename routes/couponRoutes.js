import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import express from "express";

const router = express.Router();

router.route("/").post(isAuthenticated, isAdmin, createCoupon);
router.route("/").get(getAllCoupons);
router.route("/:id").get(isAuthenticated, isAdmin, getCouponById);
router.route("/:id").put(isAuthenticated, isAdmin, updateCoupon);
router.route("/:id").delete(isAuthenticated, isAdmin, deleteCoupon);

export default router;

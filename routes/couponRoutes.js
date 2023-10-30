import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getCouponByCode,
} from "../controllers/couponController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";

import express from "express";

const router = express.Router();

router.route("/").post(isAuthenticated, isAdmin, createCoupon);
router.route("/").get(getAllCoupons);
router.route("/code/:code").get(getCouponByCode);
router.route("/:id").get(isAuthenticated, isAdmin, getCouponById);
router.route("/:id").put(isAuthenticated, isAdmin, updateCoupon);
router.route("/:id").delete(isAuthenticated, isAdmin, deleteCoupon);

export default router;

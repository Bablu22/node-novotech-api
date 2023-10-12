import Coupon from "../model/Coupon.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Create a coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 **/

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;

  const couponExists = await Coupon.findOne({ code });
  if (couponExists) {
    res.status(400);
    throw new Error("Coupon already exists");
  }
  if (isNaN(discount)) {
    res.status(400);
    throw new Error("Discount must be a number");
  }
  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    startDate,
    endDate,
    discount,
    user: req.user,
  });

  res.status(201).json({
    status: "success",
    message: "Coupon created successfully",
    coupon,
  });
});

/**
 * @desc Get all coupons
 * @route GET /api/coupons
 * @access Private/Admin
 */

export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});

  if (!coupons) {
    res.status(404);
    throw new Error("No coupon found");
  }

  res.status(200).json({
    status: "success",
    results: coupons.length,
    coupons,
  });
});

/**
 * @desc Get a coupon by id
 * @route GET /api/coupons/:id
 * @access Private/Admin
 */

export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("No coupon found");
  }

  res.status(200).json({
    status: "success",
    coupon,
  });
});

/**
 * @desc Update a coupon
 * @route PUT /api/coupons/:id
 * @access Private/Admin
 */

export const updateCoupon = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    { code: code.toUpperCase(), startDate, endDate, discount },
    { new: true }
  );

  if (!coupon) {
    res.status(404);
    throw new Error("No coupon found");
  }

  res.status(200).json({
    status: "success",
    message: "Coupon updated successfully",
    coupon,
  });
});

/**
 * @desc Delete a coupon
 * @route DELETE /api/coupons/:id
 * @access Private/Admin
 */

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("No coupon found");
  }

  res.status(200).json({
    status: "success",
    message: "Coupon deleted successfully",
  });
});

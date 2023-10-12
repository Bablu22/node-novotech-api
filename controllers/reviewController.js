import Review from "../model/Review.js";
import asyncHandler from "express-async-handler";
import Product from "../model/Product.js";

// @desc create a new review
// @route POST /api/reviews/:id
// @access Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, message } = req.body;
  const { id } = req.params;

  const productFound = await Product.findById(id);
  if (!productFound) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if the user has already reviewed the product
  const existingReview = await Review.findOne({
    user: req.user,
    product: id,
  });

  if (existingReview) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    rating,
    message,
    user: req.user,
    product: id,
  });

  productFound.reviews.push(review._id);
  await productFound.save();

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    review,
  });
});

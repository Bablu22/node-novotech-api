import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Review must belong to a user"],
      ref: "User",
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Review must belong to a product"],
      ref: "Product",
    },
    message: {
      type: String,
      required: [true, "Review must have a message"],
    },
    rating: {
      type: Number,
      required: [true, "Review must have a rating"],
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;

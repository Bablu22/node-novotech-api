import mongoose, { Schema } from "mongoose";
const schems = mongoose.Schema;

const productSchema = new schems(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Brand",
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    sizes: {
      type: [String],
      required: true,
      enum: ["S", "M", "L", "XL", "XXL"],
    },
    colors: { type: [String], required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSold: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

productSchema.virtual("totalReviews").get(function () {
  return this.reviews.length;
});

productSchema.virtual("averageRating").get(function () {
  let totalRating = 0;
  if (this.reviews.length > 0) {
    this.reviews.forEach((review) => {
      totalRating += review.rating;
    });
    return totalRating / this.reviews.length;
  }
  return totalRating;
});

// quantity left of each product
productSchema.virtual("quantityLeft").get(function () {
  return this.quantity - this.totalSold;
});

const Product = mongoose.model("Product", productSchema);

export default Product;

import mongoose from "mongoose";
const { Schema } = mongoose;

const randomText = () =>
  Math.random().toString(36).substring(2, 15).toLocaleUpperCase();

const randomNum = () => Math.floor(Math.random() * 1000000);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        type: Object,
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      default: 0.0,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    orderNumber: {
      type: String,
      default: randomText() + randomNum(),
    },
    paymentStatus: {
      type: String,
      default: "Not Paid",
    },
    paymentMethod: {
      type: String,
      default: "Not Specified",
    },
    currency: {
      type: String,
      default: "Not Specified",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    deliveredAt: {
      type: Date,
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

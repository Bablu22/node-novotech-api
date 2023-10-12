import express from "express";
import cors from "cors";
import dbConnect from "../config/dbConnect.js";
import dotenv from "dotenv";
import {
  globalErrorHandler,
  notFound,
} from "../middlewares/globalErrorHandler.js";
import Stripe from "stripe";
import Order from "../model/Order.js";
import Product from "../model/Product.js";
import User from "../model/User.js";

// Routes imports
import userRoute from "../routes/userRoute.js";
import productRoutes from "../routes/productRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import brandRoutes from "../routes/brandRoutes.js";
import colorRoutes from "../routes/colorRoutes.js";
import reviewRoutes from "../routes/reviewRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import couponRoutes from "../routes/couponRoutes.js";

dotenv.config();
dbConnect();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Replace this with your actual Stripe webhook secret
const endpointSecret =
  "whsec_b0d23e98565be9eefc29318c5089b31baceca1ee801e051e9745203bc0a3c8c5";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        endpointSecret
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const order_id = session.metadata.order_id;
        const paymentStatus = session.payment_status;
        const paymentMethod = session.payment_method_types[0];
        const totalPrice = session.metadata.totalPrice;
        const currency = session.currency;

        // Update the order in your database with payment details
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: JSON.parse(order_id) },
          {
            paymentStatus,
            paymentMethod,
            totalPrice,
            currency,
          },
          { new: true }
        );

        if (!updatedOrder) {
          console.error("Order not found:", JSON.parse(order_id));
          response.status(404).send("Order not found");
          return;
        }

        // Update product quantity and total sold
        const order = await Order.findById(JSON.parse(order_id));
        for (const item of order.orderItems) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.quantity -= item.quantity;
            product.totalSold += item.quantity;
            await product.save();
          }
        }

        // Update user's orders
        const user = await User.findById(order.user);
        if (user) {
          user.orders.push(JSON.parse(order_id));
          await user.save();
        }
      }
    } catch (err) {
      console.error("Webhook Error:", err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

// Routes
app.use("/api/v1/users/", userRoute);
app.use("/api/v1/products/", productRoutes);
app.use("/api/v1/categories/", categoryRoutes);
app.use("/api/v1/brands/", brandRoutes);
app.use("/api/v1/colors/", colorRoutes);
app.use("/api/v1/reviews/", reviewRoutes);
app.use("/api/v1/orders/", orderRoutes);
app.use("/api/v1/coupons/", couponRoutes);

// Error handling
app.use(notFound);
app.use(globalErrorHandler);

export default app;

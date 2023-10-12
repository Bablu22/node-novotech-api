import Order from "../model/Order.js";
import asyncHandler from "express-async-handler";
import User from "../model/User.js";
import Coupon from "../model/Coupon.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/*
@desc Create new order
@route POST /api/orders
@access Private
*/

export const createOrder = asyncHandler(async (req, res) => {
  // Find the user
  const user = await User.findById(req.user);

  // Check if user has a shipping address
  if (!user.hasShippingAddress) {
    res.status(400);
    throw new Error("Please add a shipping address");
  }

  // Get the payload (orderItems, totalPrice)
  const { orderItems } = req.body;

  // Check if the order is not empty
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // apply the discount coupon if any
  const { coupon } = req.query;

  // If a coupon code is provided, calculate the discount

  let totalPrice = 0;
  let discount = 0;
  let couponFound = null;

  if (coupon) {
    couponFound = await Coupon.findOne({ code: coupon.toUpperCase() });
    console.log(couponFound);

    if (!couponFound) {
      res.status(400);
      throw new Error("Coupon not found");
    }

    if (couponFound.IsExpired) {
      res.status(400);
      throw new Error("Coupon is Expired");
    }

    // Calculate the total price without considering the discount
    totalPrice = orderItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    // Calculate the discount and update the totalPrice
    discount = (totalPrice * couponFound.discount) / 100;
    totalPrice = totalPrice - discount;
  } else {
    // If no coupon is applied, calculate the total price without discount
    totalPrice = orderItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
  }

  // Create the order and save it to the database
  const order = await Order.create({
    user: req.user,
    orderItems,
    shippingAddress: user.shippingAddress,
    totalPrice,
    coupon: couponFound ? couponFound._id : null,
  });

  // Make payment (Stripe)
  const session = await stripe.checkout.sessions.create({
    line_items: orderItems.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: item.price * 100, // Convert the total to cents
        },
        quantity: item.quantity,
      };
    }),
    metadata: {
      order_id: JSON.stringify(order._id),
      total_price: totalPrice * 100,
    },
    mode: "payment",
    success_url: `http://localhost:3000/success`,
    cancel_url: `http://localhost:3000/cancel`,
  });

  // Redirect the user to the Stripe checkout page
  res.send({ url: session.url });
});

/*
@desc Get all orders
@route GET /api/orders
@access Private
*/

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({ path: "coupon", select: "code discount" });
  res.json({
    success: true,
    message: "All orders",
    orders,
  });
});

/*
@desc Get order by id
@route GET /api/orders/:id
@access Private
*/

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user");
  res.json({
    success: true,
    message: "Order found",
    order,
  });
});

/*
@desc Update order stsatus
@route PUT /api/orders/:id/pay
@access Private
*/

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const updateOrder = await Order.findByIdAndUpdate(
    id,
    { status: req.body.status },
    { new: true }
  );
  if (!updateOrder) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({
    success: true,
    message: "Order updated",
    updateOrder,
  });
});

/**
 * @desc Get order stats
 * @route GET /api/orders/stats
 * @access Private
 */

export const getOrderStats = asyncHandler(async (req, res) => {
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: {
          $min: "$totalPrice",
        },
        totalSales: {
          $sum: "$totalPrice",
        },
        maxSale: {
          $max: "$totalPrice",
        },
        avgSale: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);

  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const saleToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);

  const lastMonth = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    date.getDate()
  );

  const saleLastMonth = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: lastMonth,
          $lte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);

  res.json({
    success: true,
    message: "Order stats",
    orders,
    saleToday,
    saleLastMonth,
  });
});

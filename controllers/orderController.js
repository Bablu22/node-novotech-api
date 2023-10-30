import Order from "../model/Order.js";
import asyncHandler from "express-async-handler";
import User from "../model/User.js";
import Coupon from "../model/Coupon.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import Product from "../model/Product.js";
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
  const { orderItems, totalPrice, shippingAddress, paymentMethod } = req.body;

  // Check if the order is not empty
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  if (paymentMethod === "cash") {
    // Create the order and save it to the database
    const order = await Order.create({
      user: req.user,
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod: "cash on delivery",
    });

    // calculation products quantity and total sold
    const orderDone = await Order.findById(order._id);
    for (const item of orderDone.orderItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.totalSold += item.quantity;
        await product.save();
      }
    }

    // Update user's orders
    const user = await User.findById(order.user);
    if (user) {
      user.orders.push(order._id);
      await user.save();
    }
    return res.json({
      success: true,
      message: "Order created",
      order,
      success_url: `http://localhost:5173/order/success/${order._id}`,
      type: "cash",
    });
  }

  // Create the order and save it to the database
  else {
    const orderStripe = await Order.create({
      user: req.user,
      orderItems,
      shippingAddress,
      totalPrice,
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
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),
      metadata: {
        order_id: JSON.stringify(orderStripe._id),
        total_price: totalPrice * 100,
      },
      mode: "payment",
      success_url: `http://localhost:5173/order/success/${orderStripe._id}`,
      cancel_url: `http://localhost:3000/cancel`,
    });

    // Redirect the user to the Stripe checkout page
    res.send({ url: session.url });
  }
});

/*
@desc Get all orders
@route GET /api/orders
@access Private
*/
export const getOrders = asyncHandler(async (req, res) => {
  // Search orders by orderNumber
  const query = {};
  if (req.query.orderNumber) {
    query.orderNumber = { $regex: new RegExp(req.query.orderNumber, "i") };
  }

  try {
    const orders = await Order.find(query)
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
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
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const yesterday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - 1
  );

  // Calculate sales for today
  const todaySales = await Order.aggregate([
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

  // Calculate sales for yesterday
  const yesterdaySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: yesterday,
          $lt: today, // Sales between yesterday and today
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

  // Calculate the percentage change
  const percentageChange =
    (todaySales[0]?.totalSales - yesterdaySales[0]?.totalSales) /
    yesterdaySales[0]?.totalSales;

  // Calculate sales for the last month
  const lastMonth = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    date.getDate()
  );
  const lastMonthSales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: lastMonth,
          $lt: today, // Sales between the beginning of the last month and today
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

  // total sales
  const totalSales = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);

  const avgSales = await Order.aggregate([
    {
      $group: {
        _id: null,
        avgSales: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);

  const productSales = await Order.aggregate([
    {
      $unwind: "$orderItems",
    },
    {
      $group: {
        _id: "$orderItems.productId",
        totalSales: {
          $sum: "$orderItems.price",
        },
        count: {
          $sum: "$orderItems.quantity",
        },
        name: {
          $first: "$orderItems.name",
        },
        // show product sales percentage is good or not compare with oters
        avgSales: {
          $avg: "$orderItems.price",
        },
      },
    },
  ]);

  res.json({
    success: true,
    message: "Order stats",
    totalSales: totalSales[0]?.totalSales || 0,
    avgSales: avgSales[0]?.avgSales || 0,
    todaySales: todaySales[0]?.totalSales || 0,
    yesterdaySales: yesterdaySales[0]?.totalSales || 0,
    lastMonthSales: lastMonthSales[0]?.totalSales || 0,
    percentageChange: isNaN(percentageChange) ? null : percentageChange * 100,
    productSales,
  });
});

import User from "../model/User.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/verifyToken.js";

// @desc Register a new user
// @route POST /api/v1/users/register
// @access Public

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  // Do password hashing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Send back the new user
  if (user) {
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } else {
    throw new Error("Invalid user data");
  }
});

// @desc Login a user
// @route POST /api/v1/users/login
// @access Public

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check if user is registered
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // check if password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    token: generateToken(user._id),
  });
});

// @desc Get user profile
// @route GET /api/v1/users/profile
// @access Private

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user)
    .select("-password")
    .populate("orders");

  res.status(200).json({
    status: "success",
    user,
  });
});

// @desc Update user shipping address
// @route PUT /api/v1/users/updaue/shipping
// @access Private

export const updateUserShippingAddress = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    city,
    country,
    postalCode,
    phone,
    province,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user,
    {
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        country,
        postalCode,
        phone,
        province,
      },
      hasShippingAddress: true,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Shipping address updated successfully",
    user,
  });
});

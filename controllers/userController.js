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
    throw new Error("This email is already used");
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
        type: user.type,
      },
      token: generateToken(user._id),
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
      type: user.type,
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

  const exestingUser = await User.findById(req.user);
  const user = await User.findByIdAndUpdate(
    req.user,
    {
      shippingAddress: [
        ...exestingUser.shippingAddress,
        {
          firstName,
          lastName,
          address,
          city,
          country,
          postalCode,
          phone,
          province,
        },
      ],
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

// user shipping address delete
// @route DELETE /api/v1/users/delete/shipping/:id
// @access Private

export const deleteUserShippingAddress = asyncHandler(async (req, res) => {
  // check shpping address is exist or not with id
  const userShippingAddress = await User.findById(req.user).select(
    "shippingAddress"
  );

  const shippingAddress = userShippingAddress.shippingAddress.find(
    (address) => address._id.toString() === req.params.id
  );

  if (!shippingAddress) {
    throw new Error("Shipping address not found");
  }

  const user = await User.findByIdAndUpdate(
    req.user,
    {
      $pull: { shippingAddress: { _id: req.params.id } },
    },
    { new: true }
  );

  if (user.shippingAddress.length === 0) {
    user.hasShippingAddress = false;
  }

  res.status(200).json({
    status: "success",
    message: "Shipping address deleted successfully",
    user,
  });
});

// @desc Update user profile
// @route PUT /api/v1/users/profile
// @access Private

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // check if user is registered
  const user = await User.findById(req.user);
  if (!user) {
    throw new Error("User not found");
  }

  // check if user is registered
  const userExists = await User.findOne({ email });
  if (userExists && userExists._id.toString() !== req.user.toString()) {
    throw new Error("This email is already used");
  }

  // Do password hashing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user,
    {
      name,
      email,
      password: hashedPassword,
    },
    { new: true }
  ).select("-password");

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    user: updatedUser,
  });
});

// get all users
// @route GET /api/v1/users
// @access Private/Admin

export const getAllUsers = asyncHandler(async (req, res) => {
  // search user by email
  const query = {};
  if (req.query.email) {
    query.email = {
      $regex: req.query.email,
      $options: "i",
    };
  }
  const users = await User.find(query).select("-password");
  res.status(200).json({
    status: "success",
    users,
  });
});

// update user type
// @route PUT /api/v1/users/update/:id
// @access Private/Admin

export const updateUserType = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      type: req.body.type,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "User type updated successfully",
    user,
  });
});

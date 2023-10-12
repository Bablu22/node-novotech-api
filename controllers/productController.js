import Product from "../model/Product.js";
import asyncHandler from "express-async-handler";
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";

// @desc create a new product
// @route POST /api/products
// @access Private/Admin

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, brand, category, sizes, colors, price, quantity } =
    req.body;

  const productExists = await Product.findOne({ name });
  if (productExists) {
    res.status(400);
    throw new Error("Product already exists");
  }

  // find category by name
  const categoryName = category.toLowerCase();
  const categoryFound = await Category.findOne({ name: categoryName });
  if (!categoryFound) {
    res.status(404);
    throw new Error("Category not found! Please create a category first");
  }

  // find the brand by name
  const brandName = brand.toLowerCase();
  const brandFound = await Brand.findOne({ name: brandName });
  if (!brandFound) {
    res.status(404);
    throw new Error("Brand not found! Please create a brand first");
  }

  const convertedImgs = req.files ? req.files.map((file) => file?.path) : null;

  const data = await Product.create({
    name,
    description,
    brand,
    category,
    sizes,
    colors,
    price,
    quantity,
    user: req.user,
    images: convertedImgs,
  });

  // store the product in that category
  categoryFound.products.push(data._id);
  await categoryFound.save();

  // store the product in that brand
  brandFound.products.push(data._id);
  await brandFound.save();

  if (data) {
    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data,
    });
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});

// @desc Get all products
// @route GET /api/products
// @access Public

export const getProducts = asyncHandler(async (req, res) => {
  const query = {};

  // Search by name
  if (req.query.name) {
    query.name = { $regex: req.query.name, $options: "i" };
  }

  // Search by category
  if (req.query.category) {
    query.category = { $regex: req.query.category, $options: "i" };
  }

  // Search by brand
  if (req.query.brand) {
    query.brand = { $regex: req.query.brand, $options: "i" };
  }

  // Search by color
  if (req.query.color) {
    query.colors = { $regex: req.query.color, $options: "i" };
  }

  // Search by price
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    query.price = { $gte: priceRange[0], $lte: priceRange[1] };
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * pageSize;

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .skip(skip)
    .limit(pageSize)
    .populate("reviews")
    .exec();

  const pagination = {};

  if (skip + pageSize < total) {
    pagination.next = {
      page: page + 1,
      limit: pageSize,
    };
  }
  if (skip > 0) {
    pagination.prev = {
      page: page - 1,
      limit: pageSize,
    };
  }

  res.status(200).json({
    status: "success",
    total,
    results: products.length,
    pagination,
    products,
  });
});

// @desc Get single product
// @route GET /api/products/:id
// @access Public

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("reviews");

  if (product) {
    res.status(200).json({
      status: "success",
      product,
    });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc Update a product
// @route PUT /api/products/:id
// @access Private/Admin

export const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    brand,
    category,
    sizes,
    colors,
    price,
    quantity,
    images,
  } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      brand,
      category,
      sizes,
      colors,
      price,
      quantity,
      images,
      user: req.user,
    },
    { new: true }
  );

  if (product) {
    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      product,
    });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc Delete a product
// @route DELETE /api/products/:id
// @access Private/Admin

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (product) {
    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

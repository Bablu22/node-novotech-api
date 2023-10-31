import Product from "../model/Product.js";
import asyncHandler from "express-async-handler";
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";

// @desc create a new product
// @route POST /api/products
// @access Private/Admin

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    brand,
    category,
    images,
    sizes,
    colors,
    price,
    quantity,
  } = req.body;

  const productExists = await Product.findOne({ name });
  if (productExists) {
    res.status(400);
    throw new Error("Product already exists");
  }

  const categoryFound = await Category.findById(category);
  if (!categoryFound) {
    res.status(404);
    throw new Error("Category not found! Please create a category first");
  }

  // find the brand by name
  const brandFound = await Brand.findById(brand);
  if (!brandFound) {
    res.status(404);
    throw new Error("Brand not found! Please create a brand first");
  }

  const data = await Product.create({
    name,
    description,
    brand: brandFound._id,
    category: categoryFound._id,
    sizes: JSON.parse(sizes),
    colors: JSON.parse(colors),
    price,
    quantity,
    user: req.user,
    images: JSON.parse(images),
  });

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
    query.name = { $regex: new RegExp(req.query.name, "i") };
  }

  // Search by category (assuming you're searching by category name)
  if (req.query.category) {
    const category = req.query.category;
    const categoryId = await Category.findOne({ name: category }).select("_id");
    if (categoryId) {
      query.category = categoryId;
    }
  }

  // Search by brand (assuming you're searching by brand name)
  if (req.query.brand) {
    const brand = req.query.brand;
    const brandId = await Brand.findOne({ name: brand }).select("_id");
    if (brandId) {
      query.brand = brandId;
    }
  }

  // Search by color (exact match)
  if (req.query.color) {
    query.colors = req.query.color;
  }

  // Search by price
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    query.price = { $gte: priceRange[0], $lte: priceRange[1] };
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.limit) || 10000000;
  const skip = (page - 1) * pageSize;

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .skip(skip)
    .limit(pageSize)
    .populate([
      { path: "category", select: "name" },
      { path: "brand", select: "name" },
      { path: "reviews", select: "rating" },
    ])
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
  const product = await Product.findById(req.params.id).populate({
    path: "reviews",
    populate: {
      path: "user",
    },
  });

  const category = await Category.findOne({ _id: product.category }).select(
    "name"
  );
  const brand = await Brand.findOne({ _id: product.brand }).select("name");
  const rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  const inStock = product.quantity > 0 ? true : false;

  if (product) {
    res.status(200).json({
      status: "success",
      product: { ...product._doc, category, brand, rating, inStock },
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
  const { name, description, brand, category, sizes, colors, price, quantity,images } =
    req.body;

 

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      brand,
      category,
      sizes: JSON.parse(sizes),
      colors: JSON.parse(colors),
      price,
      quantity,
      user: req.user,
      images: JSON.parse(images),
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

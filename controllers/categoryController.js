import Category from "../model/Category.js";
import asyncHandler from "express-async-handler";

// @desc create a new category
// @route POST /api/categories
// @access Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const categoryName = name.toLowerCase();

  const categoryExists = await Category.findOne({ name: categoryName });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name: categoryName,
    image: req?.file?.path,
    user: req.user,
  });

  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    category,
  });
});

// @desc get all categories
// @route GET /api/categories
// @access Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json({
    status: "success",
    categories,
  });
});

// @desc get a single category
// @route GET /api/categories/:id
// @access Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json({
    status: "success",
    category,
  });
});

// @desc update a category
// @route PUT /api/categories/:id
// @access Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  category.name = name.toLowerCase() || category.name;
  category.image = image || category.image;

  const updatedCategory = await category.save();

  res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    updatedCategory,
  });
});

// @desc delete a category
// @route DELETE /api/categories/:id
// @access Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const deltedCategory = await Category.findByIdAndDelete(req.params.id);
  if (!deltedCategory) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
  });
});

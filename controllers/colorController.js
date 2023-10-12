import asyncHandler from "express-async-handler";
import Color from "../model/Color.js";

/**
 * @desc create a new color
 * @route POST /api/colors
 * @access Private/Admin
 **/

export const createColor = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  const colorName = name.toLowerCase();

  const colorExists = await Color.findOne({ name: colorName, code: code });
  if (colorExists) {
    res.status(400);
    throw new Error("Color already exists");
  }

  const color = await Color.create({
    name: colorName,
    code,
    user: req.user,
  });

  res.status(201).json({
    status: "success",
    message: "Color created successfully",
    color,
  });
});

/* 
@desc get all colors
@route GET /api/colors
@access Public 
*/

export const getColors = asyncHandler(async (req, res) => {
  const colors = await Color.find({});
  res.status(200).json({
    status: "success",
    colors,
  });
});

/* 
@desc get a single color
@route GET /api/colors/:id
@access Public 
*/

export const getColorById = asyncHandler(async (req, res) => {
  const color = await Color.findById(req.params.id);
  if (!color) {
    res.status(404);
    throw new Error("Color not found");
  }
  res.status(200).json({
    status: "success",
    color,
  });
});

/* 
@desc update a color
@route PUT /api/colors/:id
@access Private/Admin 
*/

export const updateColor = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  const color = await Color.findById(req.params.id);
  if (!color) {
    res.status(404);
    throw new Error("Color not found");
  }

  color.name = name.toLowerCase() || color.name;
  color.code = code || color.code;

  const updatedColor = await color.save();

  res.status(200).json({
    status: "success",
    message: "Color updated successfully",
    updatedColor,
  });
});

/* 
@desc delete a color
@route DELETE /api/colors/:id
@access Private/Admin 
*/

export const deleteColor = asyncHandler(async (req, res) => {
  const deletedColor = await Color.findByIdAndDelete(req.params.id);
  if (!deletedColor) {
    res.status(404);
    throw new Error("Color not found");
  }
  res.status(200).json({
    status: "success",
    message: "Color deleted successfully",
  });
});

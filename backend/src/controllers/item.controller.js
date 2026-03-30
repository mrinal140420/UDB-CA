import { Item } from "../models/Item.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const createItem = asyncHandler(async (req, res) => {
  const exists = await Item.findOne({ item_id: req.body.item_id });
  if (exists) {
    return res.status(409).json({ success: false, message: "Item ID already exists" });
  }
  const item = await Item.create(req.body);
  return successResponse(res, "Item created", { item }, 201);
});

export const getItems = asyncHandler(async (req, res) => {
  const { search = "", category, status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { item_id: { $regex: search, $options: "i" } },
    ];
  }
  if (category) query.category = category;
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Item.find(query)
      .populate("supplier_id", "name supplier_id")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Item.countDocuments(query),
  ]);

  return successResponse(res, "Items fetched", {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate("supplier_id", "name supplier_id");
  if (!item) return res.status(404).json({ success: false, message: "Item not found" });
  return successResponse(res, "Item fetched", { item });
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ success: false, message: "Item not found" });
  return successResponse(res, "Item updated", { item });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Item not found" });
  return successResponse(res, "Item deleted");
});

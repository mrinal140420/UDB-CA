import { Transaction } from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { createStockMovement } from "../services/transaction.service.js";

export const createStockIn = asyncHandler(async (req, res) => {
  const result = await createStockMovement({ payload: req.body, type: "IN", actor: req.user });
  return successResponse(res, "Incoming stock recorded", result, 201);
});

export const createStockOut = asyncHandler(async (req, res) => {
  const result = await createStockMovement({ payload: req.body, type: "OUT", actor: req.user });
  return successResponse(res, "Outgoing stock recorded", result, 201);
});

export const getTransactions = asyncHandler(async (req, res) => {
  const { item_id, type, startDate, endDate, page = 1, limit = 10, sort = "-date" } = req.query;
  const query = {};

  if (item_id) query.item_id = item_id;
  if (type) query.type = type;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate("item_id", "item_id name")
      .populate("supplier_id", "name supplier_id")
      .populate("performed_by", "name role")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(query),
  ]);

  return successResponse(res, "Transactions fetched", {
    transactions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate("item_id", "item_id name")
    .populate("supplier_id", "name supplier_id")
    .populate("performed_by", "name role");
  if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });
  return successResponse(res, "Transaction fetched", { transaction });
});

export const getTransactionByItem = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ item_id: req.params.itemId })
    .sort({ date: -1 })
    .populate("performed_by", "name role");
  return successResponse(res, "Item transaction history", { transactions });
});

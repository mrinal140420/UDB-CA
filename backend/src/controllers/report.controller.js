import { Item } from "../models/Item.js";
import { Transaction } from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getLowStockPipeline, getAdminSummary, getSuperAdminSummary } from "../services/report.service.js";

const REPORT_CACHE_TTL_MS = 8000;
const reportCache = {
  lowStock: { expiresAt: 0, value: null },
  workerSummary: { expiresAt: 0, value: null },
};

const getCached = (key) => {
  const entry = reportCache[key];
  if (entry?.value && entry.expiresAt > Date.now()) {
    return entry.value;
  }
  return null;
};

const setCached = (key, value) => {
  reportCache[key] = {
    value,
    expiresAt: Date.now() + REPORT_CACHE_TTL_MS,
  };
};

export const lowStockReport = asyncHandler(async (req, res) => {
  const cached = getCached("lowStock");
  if (cached) {
    return successResponse(res, "Low stock report", cached);
  }

  const lowStock = await Item.aggregate(getLowStockPipeline());
  const payload = { lowStock };
  setCached("lowStock", payload);
  return successResponse(res, "Low stock report", payload);
});

export const stockValueReport = asyncHandler(async (req, res) => {
  const result = await Item.aggregate([
    {
      $project: {
        item_id: 1,
        name: 1,
        category: 1,
        quantity: 1,
        price: 1,
        stockValue: { $multiply: ["$quantity", "$price"] },
      },
    },
    {
      $group: {
        _id: null,
        totalInventoryValue: { $sum: "$stockValue" },
        items: { $push: "$$ROOT" },
      },
    },
  ]);

  return successResponse(res, "Stock value report", {
    totalInventoryValue: result[0]?.totalInventoryValue || 0,
    items: result[0]?.items || [],
  });
});

export const categoryDistributionReport = asyncHandler(async (req, res) => {
  const data = await Item.aggregate([
    {
      $group: {
        _id: "$category",
        itemCount: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        stockValue: { $sum: { $multiply: ["$quantity", "$price"] } },
      },
    },
    { $sort: { itemCount: -1 } },
  ]);
  return successResponse(res, "Category distribution", { data });
});

export const movementSummaryReport = asyncHandler(async (req, res) => {
  const data = await Transaction.aggregate([
    {
      $group: {
        _id: {
          month: { $dateToString: { format: "%Y-%m", date: "$date" } },
          type: "$type",
        },
        totalQuantity: { $sum: "$quantity" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);
  return successResponse(res, "Movement summary", { data });
});

export const userRoleSummaryReport = asyncHandler(async (req, res) => {
  const data = await Transaction.aggregate([
    {
      $group: {
        _id: "$performed_by_role",
        transactions: { $sum: 1 },
      },
    },
  ]);
  return successResponse(res, "Transaction count by role", { data });
});

export const workerSummary = asyncHandler(async (req, res) => {
  const cached = getCached("workerSummary");
  if (cached) {
    return successResponse(res, "Worker summary", cached);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [recent, lowStock, movement] = await Promise.all([
    Transaction.find().sort({ date: -1 }).limit(8).populate("item_id", "item_id name"),
    Item.aggregate(getLowStockPipeline()),
    Transaction.aggregate([
      { $match: { date: { $gte: startOfDay } } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const incomingCount = movement.find((m) => m._id === "IN")?.count || 0;
  const outgoingCount = movement.find((m) => m._id === "OUT")?.count || 0;

  const payload = {
    recent,
    lowStock,
    incomingCount,
    outgoingCount,
    recentMovementCount: incomingCount + outgoingCount,
    lowStockCount: lowStock.length,
  };

  setCached("workerSummary", payload);
  setCached("lowStock", { lowStock });

  return successResponse(res, "Worker summary", payload);
});

export const adminSummary = asyncHandler(async (req, res) => {
  const summary = await getAdminSummary();
  return successResponse(res, "Admin summary", summary);
});

export const superAdminSummary = asyncHandler(async (req, res) => {
  const summary = await getSuperAdminSummary();
  return successResponse(res, "Super admin summary", summary);
});

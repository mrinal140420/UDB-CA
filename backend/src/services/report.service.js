import { Item } from "../models/Item.js";
import { Supplier } from "../models/Supplier.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";

export const getLowStockPipeline = () => [
  { $match: { $expr: { $lt: ["$quantity", "$reorder_level"] } } },
  {
    $lookup: {
      from: "suppliers",
      localField: "supplier_id",
      foreignField: "_id",
      as: "supplier",
    },
  },
  { $unwind: "$supplier" },
  {
    $project: {
      _id: 0,
      item_id: 1,
      name: 1,
      category: 1,
      quantity: 1,
      reorder_level: 1,
      warehouse_location: 1,
      supplier: "$supplier.name",
    },
  },
  { $sort: { quantity: 1 } },
];

export const getAdminSummary = async () => {
  const [totalItems, totalSuppliers, totalTransactions, lowStockCount, totalValueAgg, categoryDistribution, movementSummary, topMovedItems] =
    await Promise.all([
      Item.countDocuments(),
      Supplier.countDocuments(),
      Transaction.countDocuments(),
      Item.countDocuments({ $expr: { $lt: ["$quantity", "$reorder_level"] } }),
      Item.aggregate([
        { $project: { value: { $multiply: ["$quantity", "$price"] } } },
        { $group: { _id: null, totalInventoryValue: { $sum: "$value" } } },
      ]),
      Item.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 }, quantity: { $sum: "$quantity" } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: "$type",
            totalQty: { $sum: "$quantity" },
            transactionCount: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $group: { _id: "$item_id", movedQty: { $sum: "$quantity" } } },
        { $sort: { movedQty: -1 } },
        { $limit: 5 },
        { $lookup: { from: "items", localField: "_id", foreignField: "_id", as: "item" } },
        { $unwind: "$item" },
        { $project: { _id: 0, item: "$item.name", item_id: "$item.item_id", movedQty: 1 } },
      ]),
    ]);

  return {
    totalItems,
    totalSuppliers,
    totalTransactions,
    lowStockCount,
    totalInventoryValue: totalValueAgg[0]?.totalInventoryValue || 0,
    categoryDistribution,
    movementSummary,
    topMovedItems,
  };
};

export const getSuperAdminSummary = async () => {
  const admin = await getAdminSummary();

  const [totalUsers, usersByRole, transactionByRole] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Transaction.aggregate([{ $group: { _id: "$performed_by_role", count: { $sum: 1 } } }]),
  ]);

  return {
    ...admin,
    totalUsers,
    usersByRole,
    transactionByRole,
  };
};

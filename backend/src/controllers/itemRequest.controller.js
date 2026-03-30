import { ItemRequest } from "../models/ItemRequest.js";
import { Item } from "../models/Item.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { createAuditLog } from "../services/audit.service.js";

const buildRequestCode = async () => {
  const count = await ItemRequest.countDocuments();
  return `REQ${String(count + 1).padStart(4, "0")}`;
};

export const createItemRequest = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    item_id: String(req.body.item_id || "").trim().toUpperCase(),
  };

  const existingItem = await Item.findOne({ item_id: payload.item_id });
  if (existingItem) {
    return res.status(409).json({ success: false, message: "Item already exists in inventory" });
  }

  const existingPending = await ItemRequest.findOne({ item_id: payload.item_id, status: "pending" });
  if (existingPending) {
    return res.status(409).json({ success: false, message: "A pending request already exists for this item code" });
  }

  const request = await ItemRequest.create({
    request_code: await buildRequestCode(),
    ...payload,
    requested_by: req.user._id,
    requested_by_role: req.user.role,
  });

  await createAuditLog({
    user: req.user,
    action: "ITEM_REQUEST_CREATED",
    module: "item_requests",
    target_id: payload.item_id,
    details: `Requested new item ${payload.name} (${payload.item_id})`,
  });

  return successResponse(res, "Item request submitted for admin approval", { request }, 201);
});

export const getItemRequests = asyncHandler(async (req, res) => {
  const { status = "", mine = "false", page = 1, limit = 20 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (mine === "true" || req.user.role === "worker") query.requested_by = req.user._id;

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    ItemRequest.find(query)
      .populate("supplier_id", "supplier_id name")
      .populate("requested_by", "name email role")
      .populate("reviewed_by", "name email role")
      .populate("approved_item_id", "item_id name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    ItemRequest.countDocuments(query),
  ]);

  return successResponse(res, "Item requests fetched", {
    requests,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const reviewItemRequest = asyncHandler(async (req, res) => {
  const request = await ItemRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: "Item request not found" });
  }
  if (request.status !== "pending") {
    return res.status(409).json({ success: false, message: "Item request already reviewed" });
  }

  const { status, review_note = "" } = req.body;
  let item = null;

  if (status === "approved") {
    const existingItem = await Item.findOne({ item_id: request.item_id });
    if (existingItem) {
      return res.status(409).json({ success: false, message: "Cannot approve because item already exists" });
    }

    item = await Item.create({
      item_id: request.item_id,
      name: request.name,
      description: request.remarks || "Created from worker item request",
      category: request.category,
      quantity: request.requested_quantity,
      unit: request.unit || "pcs",
      price: request.suggested_price,
      cost_price: Math.max(0, Math.round((request.suggested_price || 0) * 0.75)),
      supplier_id: request.supplier_id,
      warehouse_location: request.warehouse_location || "Main",
      reorder_level: request.reorder_level,
      status: "active",
    });
  }

  request.status = status;
  request.review_note = review_note;
  request.reviewed_by = req.user._id;
  request.reviewed_by_role = req.user.role;
  request.reviewed_at = new Date();
  request.approved_item_id = item?._id || null;
  await request.save();

  await createAuditLog({
    user: req.user,
    action: status === "approved" ? "ITEM_REQUEST_APPROVED" : "ITEM_REQUEST_REJECTED",
    module: "item_requests",
    target_id: request.item_id,
    details: status === "approved" ? `Approved request and created item ${request.item_id}` : `Rejected request for ${request.item_id}`,
  });

  return successResponse(res, `Item request ${status}`, {
    request,
    item,
  });
});

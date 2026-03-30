import { Supplier } from "../models/Supplier.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const createSupplier = asyncHandler(async (req, res) => {
  const exists = await Supplier.findOne({ supplier_id: req.body.supplier_id });
  if (exists) return res.status(409).json({ success: false, message: "Supplier ID exists" });

  const supplier = await Supplier.create(req.body);
  return successResponse(res, "Supplier created", { supplier }, 201);
});

export const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort({ createdAt: -1 });
  return successResponse(res, "Suppliers fetched", { suppliers });
});

export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
  return successResponse(res, "Supplier fetched", { supplier });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
  return successResponse(res, "Supplier updated", { supplier });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
  return successResponse(res, "Supplier deleted");
});

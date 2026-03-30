import mongoose from "mongoose";

const itemRequestSchema = new mongoose.Schema(
  {
    request_code: { type: String, required: true, unique: true, trim: true },
    item_id: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    unit: { type: String, default: "pcs", trim: true },
    requested_quantity: { type: Number, min: 0, default: 0 },
    suggested_price: { type: Number, min: 0, default: 0 },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    warehouse_location: { type: String, default: "Main", trim: true },
    reorder_level: { type: Number, min: 0, default: 5 },
    remarks: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requested_by_role: { type: String, enum: ["worker", "admin", "super_admin"], required: true },
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewed_by_role: { type: String, enum: ["worker", "admin", "super_admin"], default: null },
    review_note: { type: String, default: "" },
    reviewed_at: { type: Date, default: null },
    approved_item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
  },
  { timestamps: true }
);

itemRequestSchema.index({ status: 1, createdAt: -1 });
itemRequestSchema.index({ item_id: 1, status: 1 });

export const ItemRequest = mongoose.model("ItemRequest", itemRequestSchema);

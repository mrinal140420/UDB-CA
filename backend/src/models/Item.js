import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    item_id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, required: true, trim: true },
    sku: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, default: "pcs" },
    price: { type: Number, required: true, min: 0 },
    cost_price: { type: Number, min: 0, default: 0 },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    warehouse_location: { type: String, default: "Main" },
    reorder_level: { type: Number, required: true, min: 0, default: 10 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    image_url: { type: String, default: "" },
  },
  { timestamps: true }
);

itemSchema.index({ category: 1, status: 1 });

export const Item = mongoose.model("Item", itemSchema);

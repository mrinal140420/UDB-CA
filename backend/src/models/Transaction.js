import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transaction_id: { type: String, required: true, unique: true, trim: true },
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    type: { type: String, enum: ["IN", "OUT"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, min: 0, default: 0 },
    total_amount: { type: Number, min: 0, default: 0 },
    date: { type: Date, default: Date.now, required: true },
    remarks: { type: String, default: "" },
    performed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    performed_by_role: {
      type: String,
      enum: ["worker", "admin", "super_admin"],
      required: true,
    },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

// Mandatory compound index for fast item-wise history and date-range report queries.
transactionSchema.index({ item_id: 1, date: 1 });
transactionSchema.index({ type: 1, date: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);

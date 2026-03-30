import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplier_id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    contact_person: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postal_code: { type: String, default: "" },
    country: { type: String, default: "" },
    gst_number: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

supplierSchema.index({ status: 1 });

export const Supplier = mongoose.model("Supplier", supplierSchema);

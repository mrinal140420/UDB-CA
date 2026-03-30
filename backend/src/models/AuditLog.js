import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user_name: { type: String, required: true },
    role: { type: String, enum: ["worker", "admin", "super_admin"], required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    target_id: { type: String, default: "" },
    details: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

auditLogSchema.index({ role: 1, timestamp: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
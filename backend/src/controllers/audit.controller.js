import { AuditLog } from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);
  return successResponse(res, "Audit logs fetched", { logs });
});

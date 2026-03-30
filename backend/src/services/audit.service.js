import { AuditLog } from "../models/AuditLog.js";

export const createAuditLog = async ({ user, action, module, target_id, details }) => {
  if (!user) return;
  await AuditLog.create({
    user_id: user._id,
    user_name: user.name,
    role: user.role,
    action,
    module,
    target_id: target_id || "",
    details: details || "",
  });
};

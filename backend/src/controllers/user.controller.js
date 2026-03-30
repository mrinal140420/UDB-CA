import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { createAuditLog } from "../services/audit.service.js";

export const createUser = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) {
    return res.status(409).json({ success: false, message: "Email already exists" });
  }

  const user = await User.create(req.body);
  await createAuditLog({
    user: req.user,
    action: "CREATE_USER",
    module: "users",
    target_id: user.email,
    details: `Created user with role ${user.role}`,
  });

  return successResponse(res, "User created", { user }, 201);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return successResponse(res, "Users fetched", { users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return successResponse(res, "User fetched", { user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return successResponse(res, "User updated", { user });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return successResponse(res, "User status updated", { user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return successResponse(res, "User role updated", { user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return successResponse(res, "User deleted");
});

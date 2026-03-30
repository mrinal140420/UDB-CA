import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { signToken } from "../services/auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || user.status !== "active") {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  user.last_login = new Date();
  await user.save();

  const token = signToken(user);
  return successResponse(res, "Login successful", { token, user });
});

export const me = asyncHandler(async (req, res) => {
  return successResponse(res, "Current user", { user: req.user });
});

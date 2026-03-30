import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createUserSchema,
  updateUserRoleSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "../validators/user.validator.js";

const router = Router();

router.use(authenticate, authorizeRoles("super_admin"));
router.post("/", validate(createUserSchema), createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", validate(updateUserSchema), updateUser);
router.patch("/:id/status", validate(updateUserStatusSchema), updateUserStatus);
router.patch("/:id/role", validate(updateUserRoleSchema), updateUserRole);
router.delete("/:id", deleteUser);

export default router;

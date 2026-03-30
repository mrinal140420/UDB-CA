import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  updateItem,
} from "../controllers/item.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createItemSchema, updateItemSchema } from "../validators/item.validator.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("worker", "admin", "super_admin"), getItems);
router.get("/:id", authenticate, authorizeRoles("worker", "admin", "super_admin"), getItemById);
router.post("/", authenticate, authorizeRoles("admin", "super_admin"), validate(createItemSchema), createItem);
router.put("/:id", authenticate, authorizeRoles("admin", "super_admin"), validate(updateItemSchema), updateItem);
router.delete("/:id", authenticate, authorizeRoles("super_admin"), deleteItem);

export default router;

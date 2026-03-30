import { Router } from "express";
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
} from "../controllers/supplier.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSupplierSchema, updateSupplierSchema } from "../validators/supplier.validator.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("worker", "admin", "super_admin"), getSuppliers);
router.get("/:id", authenticate, authorizeRoles("worker", "admin", "super_admin"), getSupplierById);
router.post("/", authenticate, authorizeRoles("admin", "super_admin"), validate(createSupplierSchema), createSupplier);
router.put("/:id", authenticate, authorizeRoles("admin", "super_admin"), validate(updateSupplierSchema), updateSupplier);
router.delete("/:id", authenticate, authorizeRoles("super_admin"), deleteSupplier);

export default router;

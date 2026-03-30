import { Router } from "express";
import {
  createStockIn,
  createStockOut,
  getTransactionById,
  getTransactionByItem,
  getTransactions,
} from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createStockSchema } from "../validators/transaction.validator.js";

const router = Router();

router.use(authenticate, authorizeRoles("worker", "admin", "super_admin"));
router.post("/in", validate(createStockSchema), createStockIn);
router.post("/out", validate(createStockSchema), createStockOut);
router.get("/", getTransactions);
router.get("/item/:itemId", getTransactionByItem);
router.get("/:id", getTransactionById);

export default router;

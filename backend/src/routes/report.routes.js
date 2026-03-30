import { Router } from "express";
import {
  adminSummary,
  categoryDistributionReport,
  lowStockReport,
  movementSummaryReport,
  stockValueReport,
  superAdminSummary,
  userRoleSummaryReport,
  workerSummary,
} from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/worker-summary", authenticate, authorizeRoles("worker", "admin", "super_admin"), workerSummary);
router.get("/admin-summary", authenticate, authorizeRoles("admin", "super_admin"), adminSummary);
router.get("/super-admin-summary", authenticate, authorizeRoles("super_admin"), superAdminSummary);
router.get("/low-stock", authenticate, authorizeRoles("worker", "admin", "super_admin"), lowStockReport);
router.get("/stock-value", authenticate, authorizeRoles("admin", "super_admin"), stockValueReport);
router.get("/category-distribution", authenticate, authorizeRoles("admin", "super_admin"), categoryDistributionReport);
router.get("/movement-summary", authenticate, authorizeRoles("admin", "super_admin"), movementSummaryReport);
router.get("/user-role-summary", authenticate, authorizeRoles("super_admin"), userRoleSummaryReport);

export default router;

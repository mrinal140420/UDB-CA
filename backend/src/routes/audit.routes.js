import { Router } from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("super_admin"), getAuditLogs);

export default router;

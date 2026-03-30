import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createItemRequest,
  getItemRequests,
  reviewItemRequest,
} from "../controllers/itemRequest.controller.js";
import { createItemRequestSchema, reviewItemRequestSchema } from "../validators/itemRequest.validator.js";

const router = Router();

router.use(authenticate, authorizeRoles("worker", "admin", "super_admin"));
router.post("/", validate(createItemRequestSchema), createItemRequest);
router.get("/", getItemRequests);
router.patch("/:id/status", authorizeRoles("admin", "super_admin"), validate(reviewItemRequestSchema), reviewItemRequest);

export default router;

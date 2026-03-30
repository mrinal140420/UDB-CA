import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import itemRoutes from "./routes/item.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import reportRoutes from "./routes/report.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import itemRequestRoutes from "./routes/itemRequest.routes.js";
import { dbSanitize } from "./middlewares/dbSanitize.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(dbSanitize);

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Inventory API is running",
    health: "/api/health",
  });
});

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Inventory API healthy" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Inventory API healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/item-requests", itemRequestRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

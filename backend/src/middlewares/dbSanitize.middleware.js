const hasUnsafeKey = (obj) => {
  if (!obj || typeof obj !== "object") return false;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) return true;
    if (hasUnsafeKey(obj[key])) return true;
  }

  return false;
};

export const dbSanitize = (req, res, next) => {
  if (hasUnsafeKey(req.body) || hasUnsafeKey(req.query) || hasUnsafeKey(req.params)) {
    return res.status(400).json({
      success: false,
      message: "Unsafe query payload detected",
    });
  }

  return next();
};

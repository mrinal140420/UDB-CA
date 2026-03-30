export const validate = (schema, source = "body") => (req, res, next) => {
  const target = req[source];
  const { error, value } = schema.validate(target, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((d) => d.message),
    });
  }
  req[source] = value;
  return next();
};

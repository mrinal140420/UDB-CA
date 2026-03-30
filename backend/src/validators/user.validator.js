import Joi from "joi";

export const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("worker", "admin", "super_admin").required(),
  phone: Joi.string().allow(""),
});

export const updateUserSchema = Joi.object({
  name: Joi.string(),
  phone: Joi.string().allow(""),
  status: Joi.string().valid("active", "inactive"),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid("worker", "admin", "super_admin").required(),
});

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required(),
});

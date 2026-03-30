import Joi from "joi";

export const createSupplierSchema = Joi.object({
  supplier_id: Joi.string().required(),
  name: Joi.string().required(),
  contact_person: Joi.string().allow(""),
  phone: Joi.string().allow(""),
  email: Joi.string().email().allow(""),
  address: Joi.string().allow(""),
  city: Joi.string().allow(""),
  state: Joi.string().allow(""),
  postal_code: Joi.string().allow(""),
  country: Joi.string().allow(""),
  gst_number: Joi.string().allow(""),
  status: Joi.string().valid("active", "inactive").default("active"),
});

export const updateSupplierSchema = createSupplierSchema.fork(["supplier_id", "name"], (schema) => schema.optional());

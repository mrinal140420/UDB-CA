import Joi from "joi";

export const createItemSchema = Joi.object({
  item_id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  category: Joi.string().required(),
  sku: Joi.string().allow(""),
  quantity: Joi.number().min(0).required(),
  unit: Joi.string().required(),
  price: Joi.number().min(0).required(),
  cost_price: Joi.number().min(0).default(0),
  supplier_id: Joi.string().required(),
  warehouse_location: Joi.string().required(),
  reorder_level: Joi.number().min(0).required(),
  status: Joi.string().valid("active", "inactive").default("active"),
  image_url: Joi.string().allow(""),
});

export const updateItemSchema = createItemSchema.fork(
  ["item_id", "name", "category", "quantity", "unit", "price", "supplier_id", "warehouse_location", "reorder_level"],
  (schema) => schema.optional()
);

import Joi from "joi";

export const createItemRequestSchema = Joi.object({
  item_id: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string().required(),
  unit: Joi.string().default("pcs"),
  requested_quantity: Joi.number().min(0).default(0),
  suggested_price: Joi.number().min(0).default(0),
  supplier_id: Joi.string().required(),
  warehouse_location: Joi.string().default("Main"),
  reorder_level: Joi.number().min(0).default(5),
  remarks: Joi.string().allow(""),
});

export const reviewItemRequestSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
  review_note: Joi.string().allow(""),
});

import Joi from "joi";

export const createStockSchema = Joi.object({
  item_id: Joi.string().required(),
  supplier_id: Joi.string().allow(null, ""),
  quantity: Joi.number().min(1).required(),
  unit_price: Joi.number().min(0).default(0),
  date: Joi.date().optional(),
  remarks: Joi.string().allow(""),
});

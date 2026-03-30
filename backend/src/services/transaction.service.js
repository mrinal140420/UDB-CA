import mongoose from "mongoose";
import { Item } from "../models/Item.js";
import { Transaction } from "../models/Transaction.js";
import { createAuditLog } from "./audit.service.js";

const buildTxCode = async () => {
  const count = await Transaction.countDocuments();
  return `TRX${String(count + 1).padStart(4, "0")}`;
};

export const createStockMovement = async ({ payload, type, actor }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const item = await Item.findById(payload.item_id).session(session);
    if (!item) {
      throw new Error("Item not found");
    }

    const qty = Number(payload.quantity);
    if (type === "OUT" && item.quantity < qty) {
      throw new Error("Insufficient stock for outgoing transaction");
    }

    item.quantity = type === "IN" ? item.quantity + qty : item.quantity - qty;
    await item.save({ session });

    const transaction = await Transaction.create(
      [
        {
          transaction_id: await buildTxCode(),
          item_id: item._id,
          supplier_id: payload.supplier_id || null,
          type,
          quantity: qty,
          unit_price: payload.unit_price || item.price,
          total_amount: qty * (payload.unit_price || item.price),
          date: payload.date || new Date(),
          remarks: payload.remarks || "",
          performed_by: actor._id,
          performed_by_role: actor.role,
        },
      ],
      { session }
    );

    await createAuditLog({
      user: actor,
      action: type === "IN" ? "STOCK_IN" : "STOCK_OUT",
      module: "transactions",
      target_id: item.item_id,
      details: `${type} ${qty} units for ${item.name}`,
    });

    await session.commitTransaction();
    return { item, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

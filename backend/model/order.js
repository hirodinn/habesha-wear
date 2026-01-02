import mongoose from "mongoose";
import Joi from "joi";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  orderDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
});

export const Order = mongoose.model("Order", orderSchema);

export function validateNewOrder(order) {
  const schema = Joi.object({
    userId: Joi.string().required(),
    products: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .required(),
    totalAmount: Joi.number().min(0).required(),
    status: Joi.string()
      .valid("pending", "shipped", "delivered", "cancelled")
      .default("pending"),
  });
  return schema.validate(order || {});
}

export function validateOrderUpdate(order) {
  const schema = Joi.object({
    userId: Joi.string(),
    products: Joi.array().items(
      Joi.object({
        productId: Joi.string(),
        quantity: Joi.number().min(1),
      })
    ),
    totalAmount: Joi.number().min(0),
    status: Joi.string().valid("pending", "shipped", "delivered", "cancelled"),
  });
  return schema.validate(order || {});
}

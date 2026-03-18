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
  shippingAddress: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  deliveryMethod: {
    type: String,
    enum: ["standard", "express"],
    default: "standard",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["chapa", "telebirr"],
    default: "chapa",
    required: true,
  },
  orderDate: { type: Date, default: Date.now },
  deliveredDate: {
    type: Date,
    default: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
});

export const Order = mongoose.model("Order", orderSchema);

export function validateNewOrder(order) {
  const schema = Joi.object({
    userId: Joi.objectId().required(),
    products: Joi.array()
      .items(
        Joi.object({
          productId: Joi.objectId().required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .required(),
    totalAmount: Joi.number().min(0).required(),
    shippingAddress: Joi.object({
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      phone: Joi.string().trim().required(),
      email: Joi.string().trim().email().required(),
      addressLine: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      postalCode: Joi.string().trim().required(),
    }).required(),
    deliveryMethod: Joi.string().valid("standard", "express").required(),
    paymentMethod: Joi.string().valid("chapa", "telebirr").required(),
    deliveredDate: Joi.date(),
    status: Joi.string()
      .valid("pending", "shipped", "delivered", "cancelled")
      .default("pending"),
  });
  return schema.validate(order || {});
}

export function validateOrderUpdate(order) {
  const schema = Joi.object({
    status: Joi.string().valid("pending", "shipped", "delivered", "cancelled"),
  });
  return schema.validate(order || {});
}

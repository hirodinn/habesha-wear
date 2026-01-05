import mongoose from "mongoose";
import Joi from "joi";

const itemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [itemSchema],
});

export const Cart = mongoose.model("Cart", cartSchema);

export function validateNewCart(cart) {
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
  });
  return schema.validate(cart || {});
}
export function validateUpdateCart(cart) {
  const schema = Joi.object({
    products: Joi.array().items(
      Joi.object({
        productId: Joi.objectId().required(),
        quantity: Joi.number().min(1).required(),
      })
    ),
  });
  return schema.validate(cart || {});
}

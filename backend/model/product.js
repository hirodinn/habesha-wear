import mongoose from "mongoose";
import Joi from "joi";

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  ownedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: { type: String, required: true, minlength: 10, maxlength: 30 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  images: { type: [String], default: [] },
  ratings: { type: [ratingSchema], default: [] },
  ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ["pending", "active", "archived"],
    default: "pending",
  },
});

export const Product = mongoose.model("Product", productSchema);

export function validateNewProduct(product) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(10).max(30).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().required(),
    stock: Joi.number().min(0).required(),
    images: Joi.array().items(Joi.string().uri()),
    ownedBy: Joi.objectId(),
    status: Joi.string().valid("pending", "active", "archived"),
  });
  return schema.validate(product || {});
}

export function validateProductUpdate(product) {
  const schema = Joi.object({
    stock: Joi.number().min(0).required(),
  });
  return schema.validate(product || {});
}

export function validateProductRating(payload) {
  const schema = Joi.object({
    value: Joi.number().integer().min(1).max(5).required(),
  });
  return schema.validate(payload || {});
}

export function validateProductStatusUpdate(payload) {
  const schema = Joi.object({
    status: Joi.string().valid("pending", "active", "archived").required(),
  });
  return schema.validate(payload || {});
}

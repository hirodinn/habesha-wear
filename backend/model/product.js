import mongoose from "mongoose";
import Joi from "joi";

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
  });
  return schema.validate(product || {});
}

export function validateProductUpdate(product) {
  const schema = Joi.object({
    name: Joi.string().min(3),
    description: Joi.string().min(10).max(30),
    price: Joi.number().min(0),
    category: Joi.string(),
    stock: Joi.number().min(0),
    images: Joi.array().items(Joi.string().uri()),
  });
  return schema.validate(product || {});
}

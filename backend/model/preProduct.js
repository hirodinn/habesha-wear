import mongoose from "mongoose";
import Joi from "joi";

const preProductSchema = new mongoose.Schema({
  ownedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true, minlength: 3 },
  description: { type: String, required: true, minlength: 10, maxlength: 30 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  images: { type: [String], default: [] },
  status: { type: String, enum: ["pending, accepted, rejected"] },
});

export const PreProduct = mongoose.model("PreProduct", preProductSchema);

export function validatePreProduct(preProduct) {
  const schema = Joi.object({
    ownedBy: Joi.objectId().required(),
    name: Joi.string().min(3).required(),
    description: Joi.string().min(10).max(30).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().required(),
    stock: Joi.number().min(0).required(),
    images: Joi.array().items(Joi.string().uri()),
    status: Joi.string()
      .valid("pending", "accepted", "rejected")
      .default("pending"),
  });
}
export function validatePreProductUpdate(preProduct) {
  const schema = Joi.object({
    status: Joi.string().valid("pending", "accepted", "rejected").required(),
  });
}

import mongoose from "mongoose";
import Joi from "joi";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  role: {
    type: String,
    enum: ["customer", "admin", "vendor", "owner"],
    default: "customer",
  },
  cartItems: { type: Array },
});

userSchema.methods.getAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.name, email: this.email, role: this.role },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

export const User = mongoose.model("User", userSchema);
export function validateNewUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid("customer", "vendor", "admin").default("customer"),
    password: Joi.string().min(8).required(),
    cartItems: Joi.array(),
  });
  return schema.validate(user || {});
}
export function validateUserLogin(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(user || {});
}

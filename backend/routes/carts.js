import express from "express";
import jwt from "jsonwebtoken";
import { Cart, validateNewCart, validateUpdateCart } from "../model/cart.js";
import { validateId } from "../utils/validateId.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });

  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access Denied" });
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

  try {
    if (decoded.role === "admin" || decoded.role === "owner") {
      const carts = await Cart.find();
      return res.send(carts);
    } else if (decoded.role === "customer") {
      const carts = await Cart.find({ userId: decoded._id });
      return res.send(carts);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "user not verified" });
    }
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });

  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access Denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

  const obj = { ...req.body };
  obj.userId = decoded._id;

  const { error } = validateNewCart(obj);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const cart = new Cart(obj);
    cart.save();
    res.send(cart);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });

  const token = req.cookies.token;

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

  if (decoded.role === "customer") {
    const cart = await Cart.findOne({ userId: decoded._id });
    await cart.deleteOne();
    return res.send(cart);
  }

  if (!token)
    return res.status(401).json({ success: false, message: "Access Denied" });

  const { error } = validateId(req.body);
  if (error)
    return res
      .status(400)
      .send({ success: false, message: error.details[0].message });

  try {
    if (decoded.role === "vendor") {
      return res
        .status(400)
        .json({ success: false, message: "user not verified" });
    }
    const cart = await Cart.findByIdAndDelete(req.body.id);
    res.send(cart);
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

router.put("/", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });

  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access Denied" });

  const { error } = validateUpdateCart(req.body);
  if (error)
    return res
      .status(400)
      .send({ success: false, message: error.details[0].message });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  try {
    if (decoded.role === "customer") {
      let cart = await Cart.findOne({ userId: decoded._id });
      if (!cart) {
        cart = new Cart({ userId: decoded._id, products: [] });
      }
      cart.products = req.body.products;
      await cart.save();
      res.send(cart);
    } else {
      res.status(400).json({ success: false, message: "user not verified" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

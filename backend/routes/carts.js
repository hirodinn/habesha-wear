import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Cart, validateNewCart, validateUpdateCart } from "../model/cart.js";
import { validateId } from "../utils/validateId.js";

const router = express.Router();

function normalizeIncomingProducts(products) {
  if (!Array.isArray(products)) return [];

  return products
    .map((item) => {
      const rawId = item?.productId;
      const productId =
        typeof rawId === "string"
          ? rawId
          : rawId && typeof rawId === "object"
            ? String(rawId._id || rawId.id || "")
            : "";
      const quantity = Number(item?.quantity || 0);
      return { productId, quantity };
    })
    .filter((item) => item.productId && Number.isFinite(item.quantity));
}

function validateNormalizedProducts(products, allowEmpty = false) {
  if (!Array.isArray(products)) return "Cart products are required.";
  if (products.length === 0) return allowEmpty ? null : "Cart products are required.";

  const invalid = products.find(
    (p) => !mongoose.Types.ObjectId.isValid(p.productId) || !Number.isInteger(p.quantity) || p.quantity < 1
  );

  if (invalid) {
    return "Each cart item must include a valid productId and quantity >= 1.";
  }

  return null;
}

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
      const carts = await Cart.find()
        .populate("userId", "name email")
        .populate("products.productId", "name images price category");
      return res.send(carts);
    } else if (decoded.role === "customer") {
      const carts = await Cart.find({ userId: decoded._id })
        .populate("userId", "name email")
        .populate("products.productId", "name images price category");
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
  obj.products = normalizeIncomingProducts(req.body?.products);
  obj.userId = decoded._id;

  const normalizedProductsError = validateNormalizedProducts(obj.products);
  if (normalizedProductsError) {
    return res.status(400).json({ success: false, message: normalizedProductsError });
  }

  const { error } = validateNewCart(obj);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const cart = new Cart(obj);
    await cart.save();
    await cart.populate("products.productId", "name images price category");
    return res.send(cart);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
    if (cart) await cart.deleteOne();
    return res.send(cart || null);
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

router.delete("/:id", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });

  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access Denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner") {
    return res
      .status(403)
      .json({ success: false, message: "Only admins/owners can delete carts" });
  }

  const { error } = validateId(req.params.id);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart)
      return res.status(404).json({ success: false, message: "Cart not found" });
    return res.send(cart);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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

  const normalizedProducts = normalizeIncomingProducts(req.body?.products);
  const normalizedProductsError = validateNormalizedProducts(normalizedProducts, true);
  if (normalizedProductsError) {
    return res.status(400).json({ success: false, message: normalizedProductsError });
  }

  const { error } = validateUpdateCart({ products: normalizedProducts });
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

      cart.products = normalizedProducts;
      await cart.save();
      await cart.populate("products.productId", "name images price category");
      return res.send(cart);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "user not verified" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

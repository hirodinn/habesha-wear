import express from "express";
import {
  Product,
  validateNewProduct,
  validateProductUpdate,
} from "../model/product.js";
import jwt from "jsonwebtoken";
import { validateId } from "../utils/validateId.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { error } = validateId(req.params.id);
  if (error) res.status(400).json({ message: error.details[0].message });

  try {
    const product = await product.findOne({ _id: req.params.id });
    if (product) res.send(product);
    else res.status(404).json({ success: false, message: "Product Not Found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    return res.status(401).json({ success: false, message: "Access denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner")
    return res.status(403).json({
      success: false,
      message: "Only Admins and Owners are allowed to post products",
    });

  const { error } = validateNewProduct(req.body);
  if (error) res.status(400).json({ message: error.details[0].message });

  try {
    const product = new Product(req.body);
    await product.save();
    res.send(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    return res.status(401).json({ success: false, message: "Access denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner")
    return res.status(403).json({
      success: false,
      message: "Only Admins and Owners are allowed to post products",
    });

  const { error } = validateId(req.params.id);
  if (error) res.status(400).json({ message: error.details[0].message });

  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.send(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });

  var { error } = validateId(req.params.id);
  if (error) res.status(400).json({ message: error.details[0].message });

  var { error } = validateProductUpdate(req.body);
  if (error) res.status(400).json({ message: error.details[0].message });

  try {
    const product = await Product.findById(req.params.id);
    product.stock = req.body.stock;
    product.save();
    res.send(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

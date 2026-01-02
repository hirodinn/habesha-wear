import express from "express";
import { Product, validateNewProduct } from "../model/product.js";
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

export default router;

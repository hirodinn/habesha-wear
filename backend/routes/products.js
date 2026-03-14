import express from "express";
import {
  Product,
  validateNewProduct,
  validateProductUpdate,
  validateProductRating,
} from "../model/product.js";
import jwt from "jsonwebtoken";
import { validateId } from "../utils/validateId.js";

const router = express.Router();

// Top-rated featured products (e.g. limit=3)
router.get("/featured", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 3, 10);
    const products = await Product.find()
      .sort({ ratingAverage: -1, ratingCount: -1 })
      .limit(limit)
      .lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const excludeFeatured = req.query.excludeFeatured === "1";
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const usePagination = excludeFeatured || pageParam != null || limitParam != null;

    if (usePagination) {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
      let query = {};
      if (excludeFeatured) {
        const featured = await Product.find()
          .sort({ ratingAverage: -1, ratingCount: -1 })
          .limit(3)
          .select("_id")
          .lean();
        query = { _id: { $nin: featured.map((p) => p._id) } };
      }
      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ ratingAverage: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query),
      ]);
      return res.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
    }

    const products = await Product.find().sort({ ratingAverage: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { error } = validateId(req.params.id);
  if (error) res.status(400).json({ message: error.details[0].message });

  try {
    const product = await Product.findOne({ _id: req.params.id });
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
    if (product.stock >= req.body.stock) {
      product.stock -= req.body.stock;
      product.save();
      res.send(product);
    } else {
      res
        .status(400)
        .json({ success: false, message: "amount greater than we got" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id/rating", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });

  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Only customers can rate products",
    });
  }

  const { error: idError } = validateId(req.params.id);
  if (idError)
    return res
      .status(400)
      .json({ success: false, message: idError.details[0].message });

  const { error: ratingError } = validateProductRating(req.body);
  if (ratingError)
    return res
      .status(400)
      .json({ success: false, message: ratingError.details[0].message });

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product Not Found" });
    }

    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.userId.toString() === decoded._id
    );

    if (existingRatingIndex >= 0) {
      product.ratings[existingRatingIndex].value = req.body.value;
    } else {
      product.ratings.push({ userId: decoded._id, value: req.body.value });
    }

    const total = product.ratings.reduce((sum, r) => sum + r.value, 0);
    product.ratingCount = product.ratings.length;
    product.ratingAverage =
      product.ratingCount > 0
        ? Math.round((total / product.ratingCount) * 10) / 10
        : 0;

    await product.save();
    return res.send(product);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

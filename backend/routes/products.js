import express from "express";
import {
  Product,
  validateNewProduct,
  validateProductUpdate,
  validateProductRating,
  validateProductStatusUpdate,
} from "../model/product.js";
import jwt from "jsonwebtoken";
import { validateId } from "../utils/validateId.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

function getDecodedToken(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (_) {
    return null;
  }
}

function getVisibilityFilter(req, { includeMine = false } = {}) {
  const decoded = getDecodedToken(req);
  const isAdmin = decoded?.role === "admin" || decoded?.role === "owner";
  const isVendor = decoded?.role === "vendor";

  if (isAdmin) return {};

  if (isVendor && includeMine && decoded?._id) {
    return { ownedBy: decoded._id };
  }

  return { status: { $in: ["active", null] } };
}

function buildProductQuery(q, category) {
  const query = {};

  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), "i");
    query.$or = [{ name: regex }, { description: regex }, { category: regex }];
  }

  if (category && category.trim() && category !== "all") {
    query.category = new RegExp(`^${category.trim()}$`, "i");
  }

  return query;
}

// Top-rated featured products (e.g. limit=3)
router.get("/featured", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 3, 10);
    const visibilityFilter =
      req.query.scope === "shop"
        ? { status: { $in: ["active", null] } }
        : getVisibilityFilter(req);
    const query = {
      ...buildProductQuery(req.query.q, req.query.category),
      ...visibilityFilter,
    };
    const products = await Product.find(query)
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
    const decoded = getDecodedToken(req);
    const isAdmin = decoded?.role === "admin" || decoded?.role === "owner";
    const includeMine = req.query.mine === "1";
    const visibilityFilter =
      req.query.scope === "shop"
        ? { status: { $in: ["active", null] } }
        : getVisibilityFilter(req, { includeMine });
    let baseQuery = {
      ...buildProductQuery(req.query.q, req.query.category),
      ...visibilityFilter,
    };

    if (req.query.status) {
      const requestedStatus = String(req.query.status).toLowerCase();
      const allowed = ["pending", "active", "archived"];
      if (!allowed.includes(requestedStatus)) {
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      }

      if (!isAdmin && !(decoded?.role === "vendor" && includeMine)) {
        return res
          .status(403)
          .json({ success: false, message: "Not allowed to filter by status" });
      }

      baseQuery.status = requestedStatus;
    }

    const excludeFeatured = req.query.excludeFeatured === "1";
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const usePagination = excludeFeatured || pageParam != null || limitParam != null;

    if (usePagination) {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
      let query = { ...baseQuery };
      if (excludeFeatured) {
        const featured = await Product.find(baseQuery)
          .sort({ ratingAverage: -1, ratingCount: -1 })
          .limit(3)
          .select("_id")
          .lean();
        query = {
          ...query,
          _id: { $nin: featured.map((p) => p._id) },
        };
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

    const products = await Product.find(baseQuery)
      .sort({ ratingAverage: -1 })
      .lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { error } = validateId(req.params.id);
  if (error) res.status(400).json({ message: error.details[0].message });

  try {
    const decoded = getDecodedToken(req);
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product Not Found" });
    }

    const isAdmin = decoded?.role === "admin" || decoded?.role === "owner";
    const isVendorOwner =
      decoded?.role === "vendor" &&
      decoded?._id &&
      String(product.ownedBy) === String(decoded._id);
    const isPublicVisible = !product.status || product.status === "active";

    if (!isPublicVisible && !isAdmin && !isVendorOwner) {
      return res.status(404).json({ success: false, message: "Product Not Found" });
    }

    res.send(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", upload.array("images", 5), async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner" && decoded.role !== "vendor")
    return res.status(403).json({
      success: false,
      message: "Only Admins, Owners, and Vendors are allowed to post products",
    });

  const obj = { ...req.body };
  try {
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "habesha-wear/products",
              resource_type: "image",
              transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
        const url = await uploadPromise;
        imageUrls.push(url);
      }
      obj.images = imageUrls;
    }

    if (decoded.role === "vendor") {
      obj.ownedBy = decoded._id;
      obj.status = "pending";
    } else {
      if (!obj.ownedBy) obj.ownedBy = decoded._id;
      if (!obj.status) obj.status = "active";
    }

    const { error } = validateNewProduct(obj);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const product = new Product(obj);
    await product.save();
    res.send(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/status", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });

  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Only Admins and Owners can change product status",
    });
  }

  const { error: idError } = validateId(req.params.id);
  if (idError)
    return res.status(400).json({ success: false, message: idError.details[0].message });

  const { error: statusError } = validateProductStatusUpdate(req.body);
  if (statusError)
    return res
      .status(400)
      .json({ success: false, message: statusError.details[0].message });

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!product)
      return res.status(404).json({ success: false, message: "Product Not Found" });
    return res.send(product);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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

    if (!Array.isArray(product.ratings)) product.ratings = [];

    product.ratings = product.ratings.filter(
      (r) => r && r.userId && r.userId.toString() !== decoded._id
    );
    product.ratings.push({ userId: decoded._id, value: req.body.value });

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

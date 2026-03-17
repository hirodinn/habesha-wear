import express from "express";
import jwt from "jsonwebtoken";
import {
  PreProduct,
  validateNewPreProduct,
  validatePreProductUpdate,
} from "../model/preProduct.js";
import { Product } from "../model/product.js";
import { validateId } from "../utils/validateId.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

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
    if (decoded.role === "owner" || decoded.role === "admin") {
      const preProducts = await PreProduct.find();
      res.send(preProducts);
    } else if (decoded.role === "vendor") {
      const preProducts = await PreProduct.find({ ownedBy: decoded._id });
      res.send(preProducts);
    } else {
      res.status(400).json({ success: false, message: "User is not verified" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    return res.status(401).json({ success: false, message: "Access Denied" });

  const obj = { ...req.body };
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  obj.ownedBy = decoded._id;

  try {
    // Upload images to Cloudinary if any
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload to Cloudinary using upload_stream
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
    }

    // Add image URLs to product data
    obj.images = imageUrls;

    const { error } = validateNewPreProduct(obj);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    if (decoded.role === "vendor") {
      const preProduct = new PreProduct(obj);
      await preProduct.save();
      res.send(preProduct);
    } else {
      res
        .status(400)
        .json({ success: false, message: "user not allowed to post products" });
    }
  } catch (err) {
    console.error("Error creating preproduct:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/** Approve: create Product from pre-product, then delete the pre-product. */
router.post("/:id/approve", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access Denied" });

  const { error: idError } = validateId(req.params.id);
  if (idError)
    return res.status(400).json({ success: false, message: idError.details[0].message });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "owner" && decoded.role !== "admin")
    return res.status(403).json({
      success: false,
      message: "Only admins/owners can approve pre-products",
    });

  try {
    const preProduct = await PreProduct.findById(req.params.id);
    if (!preProduct)
      return res.status(404).json({ success: false, message: "Pre-product not found" });
    if (preProduct.status !== "pending")
      return res.status(400).json({ success: false, message: "Only pending items can be approved" });

    const { _id, __v, status, ...productData } = preProduct.toObject();
    const product = new Product(productData);
    await product.save();
    await PreProduct.findByIdAndDelete(req.params.id);
    res.send(product);
  } catch (err) {
    console.error("Error approving pre-product:", err);
    res.status(500).json({ success: false, message: err.message });
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
    return res.status(401).json({ success: false, message: "Access Denied" });

  var { error } = validateId(req.params.id);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  var { error } = validatePreProductUpdate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

  try {
    if (decoded.role === "owner" || decoded.role === "admin") {
      const preProduct = await PreProduct.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.send(preProduct);
    } else {
      res
        .status(400)
        .json({ success: false, message: "User can't modify products" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
  if (decoded.role !== "owner" && decoded.role !== "admin")
    return res.status(403).json({
      success: false,
      message: "Only Admins/Owners can delete requests",
    });

  try {
    const preProduct = await PreProduct.findByIdAndDelete(req.params.id);
    if (!preProduct)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    res.send(preProduct);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

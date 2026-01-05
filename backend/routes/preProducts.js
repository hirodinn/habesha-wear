import express from "express";
import jwt from "jsonwebtoken";
import { PreProduct } from "../model/preProduct.js";

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

export default router;

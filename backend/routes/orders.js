import express from "express";
import jwt from "jsonwebtoken";
import { validateId } from "../utils/validateId.js";
import {
  Order,
  validateNewOrder,
  validateOrderUpdate,
} from "../model/order.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

  try {
    if (decoded.role === "admin" || decoded.role === "owner") {
      const orders = await Order.find();
      res.send(orders);
    } else if (decoded.role === "customer") {
      const orders = await Order.find({ userId: decoded._id });
      res.send(orders);
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
  let obj = { ...req.body };
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  obj.userId = decoded._id;
  console.log(obj);
  const { error } = validateNewOrder(obj);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    let order = new Order(obj);
    order = await order.save();
    res.send(order);
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
    return res.status(401).json({ success: false, message: "Access denied" });
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "only admins and owners can delete order",
    });
  }
  const { error } = validateId(req.params.id);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (order) res.send(order);
    else res.status(404).json({ success: false, message: "Order Not Found" });
  } catch (err) {
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
    return res.status(401).json({ success: false, message: "Access denied" });

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "only admins and owners can update order",
    });
  }

  var { error } = validateId(req.params.id);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  var { error } = validateOrderUpdate(req.body);

  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (order) res.send(order);
    else res.status(404).json({ success: false, message: "Order Not Found" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
export default router;

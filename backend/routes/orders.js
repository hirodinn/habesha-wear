import express from "express";
import { validateId } from "../utils/validateId.js";
import { Order, validateNewOrder } from "../model/order.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { error } = validateId(req.params.id);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  try {
    const order = await Order.findById(req.params.id);
    if (order) res.send(order);
    else res.status(404).json({ success: false, message: "Order Not Found" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  const { error } = validateNewOrder(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    let order = new Order(req.body);
    order = await order.save();
    res.send(order);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
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
  const { error } = validateId(req.params.id);
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

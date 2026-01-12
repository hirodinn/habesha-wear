import express from "express";
import { Product } from "../model/product.js";
import { User } from "../model/user.js";
import { Order } from "../model/order.js";
import { Cart } from "../model/cart.js";
import { PreProduct } from "../model/preProduct.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();
    const pendingProductsCount = await PreProduct.countDocuments({
      status: "pending",
    });
    const ordersCount = await Order.countDocuments();
    const cartsCount = await Cart.countDocuments();

    res.send({
      products: productsCount,
      users: usersCount,
      pendingProducts: pendingProductsCount,
      orders: ordersCount,
      carts: cartsCount,
    });
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

export default router;

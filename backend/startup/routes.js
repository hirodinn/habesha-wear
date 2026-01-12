import express from "express";
import cookieParser from "cookie-parser";
import orders from "../routes/orders.js";
import products from "../routes/products.js";
import users from "../routes/users.js";
import carts from "../routes/carts.js";
import preProducts from "../routes/preProducts.js";

import stats from "../routes/stats.js";

export default function (app) {
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/users", users);
  app.use("/api/products", products);
  app.use("/api/orders", orders);
  app.use("/api/carts", carts);
  app.use("/api/preproducts", preProducts);
  app.use("/api/stats", stats);
}

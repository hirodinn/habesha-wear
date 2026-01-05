import express from "express";
import cookieParser from "cookie-parser";
import orders from "../routes/orders.js";
import products from "../routes/products.js";
import users from "../routes/users.js";
import carts from "../routes/carts.js";
import preProducts from "../routes/preProducts.js";

export default function (app) {
  app.use(express.json());
  app.use(cookieParser());
  app.use("/users", users);
  app.use("/products", products);
  app.use("/orders", orders);
  app.use("/carts", carts);
  app.use("/preproducts", preProducts);
}

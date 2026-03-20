import express from "express";
import cookieParser from "cookie-parser";
import orders from "../routes/orders.js";
import products from "../routes/products.js";
import users from "../routes/users.js";
import carts from "../routes/carts.js";

import stats from "../routes/stats.js";

export default function (app) {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://habesha-wear-rjdd.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      res.header("Access-Control-Allow-Origin", requestOrigin || allowedOrigins[0]);
    }
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    return next();
  });

  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/users", users);
  app.use("/api/products", products);
  app.use("/api/orders", orders);
  app.use("/api/carts", carts);
  app.use("/api/stats", stats);
}

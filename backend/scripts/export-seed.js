import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const SOURCE_URI =
  process.env.SEED_SOURCE_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost/habesha-wear";

const OUTPUT_PATH = path.resolve(process.cwd(), "seed", "data.json");

const toPlain = (value) => {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === "object") {
    if (typeof value.toHexString === "function") return value.toHexString();
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toPlain(v);
    return out;
  }
  return value;
};

const main = async () => {
  await mongoose.connect(SOURCE_URI);

  const db = mongoose.connection.db;

  const [users, products, orders, carts] = await Promise.all([
    db.collection("users").find({}).toArray(),
    db.collection("products").find({}).toArray(),
    db.collection("orders").find({}).toArray(),
    db.collection("carts").find({}).toArray(),
  ]);

  const seed = {
    meta: {
      exportedAt: new Date().toISOString(),
      source: SOURCE_URI,
    },
    users: toPlain(users),
    products: toPlain(products),
    orders: toPlain(orders),
    carts: toPlain(carts),
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(seed, null, 2), "utf8");

  console.log(`Seed exported to ${OUTPUT_PATH}`);
  console.log(
    `users=${seed.users.length}, products=${seed.products.length}, orders=${seed.orders.length}, carts=${seed.carts.length}`
  );

  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error("Seed export failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});

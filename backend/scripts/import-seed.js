import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const TARGET_URI = process.env.MONGO_URI;
const SEED_PATH = path.resolve(process.cwd(), "seed", "data.json");

if (!TARGET_URI) {
  console.error("MONGO_URI is required to run seed import.");
  process.exit(1);
}

const looksLikeObjectId = (value) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

const reviveObjectIds = (value, key = "") => {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((v) => reviveObjectIds(v, key));

  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = reviveObjectIds(v, k);
    }
    return out;
  }

  if (looksLikeObjectId(value) && (key === "_id" || key.endsWith("Id") || key.endsWith("By"))) {
    return new mongoose.Types.ObjectId(value);
  }

  return value;
};

const upsertCollection = async (db, collectionName, docs = []) => {
  if (!Array.isArray(docs) || docs.length === 0) return 0;

  const ops = docs.map((doc) => {
    const normalized = reviveObjectIds(doc);
    if (doc && doc._id) {
      return {
        replaceOne: {
          filter: { _id: normalized._id },
          replacement: normalized,
          upsert: true,
        },
      };
    }
    return { insertOne: { document: normalized } };
  });

  const result = await db.collection(collectionName).bulkWrite(ops, {
    ordered: false,
  });

  return (result.upsertedCount || 0) + (result.insertedCount || 0) + (result.modifiedCount || 0);
};

const main = async () => {
  const raw = await fs.readFile(SEED_PATH, "utf8");
  const seed = JSON.parse(raw);

  await mongoose.connect(TARGET_URI);
  const db = mongoose.connection.db;

  const usersCount = await upsertCollection(db, "users", seed.users || []);
  const productsCount = await upsertCollection(db, "products", seed.products || []);
  const ordersCount = await upsertCollection(db, "orders", seed.orders || []);
  const cartsCount = await upsertCollection(db, "carts", seed.carts || []);

  console.log("Seed import complete.");
  console.log(
    `users=${usersCount}, products=${productsCount}, orders=${ordersCount}, carts=${cartsCount}`
  );

  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error("Seed import failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});

import express from "express";
import loadDB from "./startup/db.js";
import loadRoutes from "./startup/routes.js";
import joi from "joi-objectid";
import Joi from "joi";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
const SEED_FILE_PATH = "seed/data.json";

Joi.objectId = joi(Joi);

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "ok" });
});

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
		if (normalized && normalized._id) {
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

const runSeedIfNeeded = async () => {
	console.log(`[SEED] Starting startup seed from ${SEED_FILE_PATH}`);

	const db = mongoose.connection.db;
	if (!db) throw new Error("[SEED] Mongo connection is not ready for seeding.");

	const fullSeedPath = path.resolve(process.cwd(), SEED_FILE_PATH);
	console.log(`[SEED] Reading file: ${fullSeedPath}`);

	const raw = await fs.readFile(fullSeedPath, "utf8");
	const seed = JSON.parse(raw);

	console.log("[SEED] Upserting users...");
	const usersCount = await upsertCollection(db, "users", seed.users || []);

	console.log("[SEED] Upserting products...");
	const productsCount = await upsertCollection(db, "products", seed.products || []);

	console.log("[SEED] Upserting orders...");
	const ordersCount = await upsertCollection(db, "orders", seed.orders || []);

	console.log("[SEED] Upserting carts...");
	const cartsCount = await upsertCollection(db, "carts", seed.carts || []);

	console.log("[SEED] Seed import complete.");
	console.log(
		`[SEED] users=${usersCount}, products=${productsCount}, orders=${ordersCount}, carts=${cartsCount}`
	);
};

const start = async () => {
	try {
		console.log("[BOOT] Starting backend server...");
		await loadDB();
		console.log("[BOOT] Database connected.");
		await runSeedIfNeeded();
		console.log("[BOOT] Seed step finished.");
		loadRoutes(app);
		app.listen(PORT, () => console.log(`connected to port ${PORT}...`));
	} catch (err) {
		console.error("[BOOT] Server startup failed:", err.message);
		console.error(err);
		process.exit(1);
	}
};

start();

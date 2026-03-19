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
const SEED_ON_BOOT = String(process.env.SEED_ON_BOOT || "false").toLowerCase() === "true";
const SEED_FILE_PATH = process.env.SEED_FILE_PATH || "seed/data.json";
const SEED_FLAG_KEY = process.env.SEED_FLAG_KEY || "initial_seed_v1_done";

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
	if (!SEED_ON_BOOT) return;

	const db = mongoose.connection.db;
	if (!db) throw new Error("Mongo connection is not ready for seeding.");

	const flags = db.collection("system_flags");
	const alreadySeeded = await flags.findOne({ key: SEED_FLAG_KEY });
	if (alreadySeeded) {
		console.log(`Seed skipped: ${SEED_FLAG_KEY} already set.`);
		return;
	}

	const raw = await fs.readFile(path.resolve(process.cwd(), SEED_FILE_PATH), "utf8");
	const seed = JSON.parse(raw);

	const usersCount = await upsertCollection(db, "users", seed.users || []);
	const productsCount = await upsertCollection(db, "products", seed.products || []);
	const ordersCount = await upsertCollection(db, "orders", seed.orders || []);
	const cartsCount = await upsertCollection(db, "carts", seed.carts || []);

	await flags.insertOne({
		key: SEED_FLAG_KEY,
		createdAt: new Date(),
		summary: {
			users: usersCount,
			products: productsCount,
			orders: ordersCount,
			carts: cartsCount,
		},
	});

	console.log("Seed import on startup complete.");
	console.log(
		`users=${usersCount}, products=${productsCount}, orders=${ordersCount}, carts=${cartsCount}`
	);
};

const start = async () => {
	try {
		await loadDB();
		await runSeedIfNeeded();
		loadRoutes(app);
		app.listen(PORT, () => console.log(`connected to port ${PORT}...`));
	} catch (err) {
		console.error("Server startup failed:", err.message);
		process.exit(1);
	}
};

start();

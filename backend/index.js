import express from "express";
import loadDB from "./startup/db.js";
import loadRoutes from "./startup/routes.js";
import joi from "joi-objectid";
import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);

Joi.objectId = joi(Joi);

loadDB();
loadRoutes(app);
app.listen(PORT, () => console.log(`connected to port ${PORT}...`));

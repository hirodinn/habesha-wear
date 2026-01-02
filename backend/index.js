import express from "express";
import loadDB from "./startup/db.js";
import loadRoutes from "./startup/routes.js";
import joi from "joi-objectid";
import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();
const app = express();

Joi.objectId = joi(Joi);

loadDB();
loadRoutes(app);
app.listen(3000, () => console.log("connected to port 3000..."));

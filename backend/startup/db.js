import mongoose from "mongoose";
export default function () {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost/habesha-wear";
  return mongoose
    .connect(mongoUri)
    .then(() => console.log(`Connected to habesha wear...`))
    .catch((err) => {
      console.error(
        `Could not connect to MongoDB at habesha wear...`,
        err.message
      );
      throw err;
    });
}

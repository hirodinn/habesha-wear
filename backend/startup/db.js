import mongoose from "mongoose";
export default function () {
  mongoose
    .connect("mongodb://localhost/habesha-wear")
    .then(() => console.log(`Connected to habesha wear...`))
    .catch((err) => {
      console.error(
        `Could not connect to MongoDB at habesha wear...`,
        err.message
      );
    });
}

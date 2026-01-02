import express from "express";
import { User, validateNewUser, validateUserLogin } from "../model/user.js";
import { validateId } from "../utils/validateId.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { error } = validateId(req.params.id);
  if (error) return res.status(400).send("Invalid user ID");
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/", async (req, res) => {
  const { error } = validateNewUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    let user = new User(req.body);
    user = await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  const { error } = validateUserLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(400).send("Invalid email or password");
    }
    res.send(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

export default router;

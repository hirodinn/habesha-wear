import express from "express";
import bcrypt from "bcrypt";
import { User, validateNewUser, validateUserLogin } from "../model/user.js";

const router = express.Router();

router.get("/me", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });
  try {
    const user = await User.findByToken(token).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.send(user);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { error } = validateNewUser(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  try {
    let user = new User(req.body);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user.password = hashedPassword;
    user = await user.save();
    res.cookie("token", user.getAuthToken(), {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).send(user);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { error } = validateUserLogin(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "email or password error" });
    const isValid = await bcrypt.compare(req.body.password, user.password);
    const token = user.getAuthToken();
    if (isValid) {
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({
        success: true,
        message: `Login successful, Welcome ${user.name}`,
      });
    } else
      res
        .status(404)
        .json({ success: false, message: "email or password error" });
    res.send(user);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, validateNewUser, validateUserLogin } from "../model/user.js";
import { validateId } from "../utils/validateId.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner")
    return res.status(403).json({
      success: false,
      message: "Only Admins and Owners are allowed to see all users",
    });

  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

router.get("/me", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

  try {
    const user = await User.findById(decoded._id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    else res.send(user);
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
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  res.set({
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  });
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.role !== "admin" && decoded.role !== "owner")
    return res.status(403).json({
      success: false,
      message: "Only Admins and Owners are allowed to delete users",
    });
  const { error } = validateId(req.params.id);
  if (error) res.status(400).json({ message: error.details[0].message });
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    if (user.role === "owner")
      return res
        .status(404)
        .json({ success: false, message: "owner can't be deleted" });
    if (user.role === "admin" && decoded.role !== "owner")
      return res
        .status(404)
        .json({ success: false, message: "Only owner can delete admins" });
    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

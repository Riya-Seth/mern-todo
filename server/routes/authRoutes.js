const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ SIGNUP Route (with Avatar)
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body; // 👈 include avatar

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with avatar
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar:
        avatar ||
        "https://api.dicebear.com/9.x/adventurer/svg?seed=default", // ✅ default avatar if not provided
    });

    // Create JWT Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        xp: newUser.xp,
        level: newUser.level,
        avatar: newUser.avatar, // 👈 include avatar
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });
  }
});

// ✅ LOGIN Route (returns avatar too)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        avatar: user.avatar, // ✅ send avatar
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message,
    });
  }
});
// ✅ UPDATE AVATAR Route (Protected)
router.put("/users/avatar", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res.status(401).json({ message: "No token provided" });

    // 🔑 Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // 🖼️ Update avatar field
    user.avatar = req.body.avatar;
    await user.save();

    res.status(200).json({
      message: "Avatar updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Avatar update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 }, // 🏅 for gamification
  level: { type: Number, default: 1 },
  badges: { type: [String], default: [] },
  streak: { type: Number, default: 0 },
  lastCompletionDate: { type: String, default: null },
  avatar: {
    type: String,
    default: "https://api.dicebear.com/9.x/adventurer/svg?seed=default",
  },
});

module.exports = mongoose.model("User", userSchema);

const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// 👤 Get current user's XP & Level
// 👤 Get current user's XP, Level, and Streak
router.get("/user/xp", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("xp level streak");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      xp: user.xp,
      level: user.level,
      streak: user.streak || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🎖️ Get user badges
router.get("/user/badges", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("badges");
    res.json(user.badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET all todos (for logged-in user)
router.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user }); // scoped by user
    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST - create new todo
router.post("/", auth, async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text,
      dueDate: req.body.dueDate || null,
      category: req.body.category || "General",
      user: req.user, // link todo to user
    });
    await newTodo.save();
    res.json(newTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT - toggle completed & award XP
router.put("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.completed = !todo.completed;
    await todo.save();

    // 🏅 Award XP only when marking complete
    // 🏅 Award XP only when marking complete
if (todo.completed) {
  const user = await User.findById(req.user);
  user.xp += 10;

  // Level system
  const newLevel = Math.floor(user.xp / 100) + 1;
  if (newLevel > user.level) user.level = newLevel;

  // Badges
  if (user.xp >= 100 && !user.badges.includes("Rising Star")) {
    user.badges.push("Rising Star");
  }
  if (user.level >= 5 && !user.badges.includes("Level Up Legend")) {
    user.badges.push("Level Up Legend");
  }

  // 🔥 Streak system
  const today = new Date().toDateString();
  const lastDate = user.lastCompletionDate ? new Date(user.lastCompletionDate) : null;

  if (user.lastCompletionDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
      user.streak += 1; // continued streak
    } else {
      user.streak = 1; // first or reset streak
    }

    user.lastCompletionDate = today;
  }

  await user.save();
}

    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE all todos (clear today’s tasks)
router.delete("/all", auth, async (req, res) => {
  try {
    await Todo.deleteMany({ user: req.user });
    res.json({ message: "All todos cleared for new day" });
  } catch (err) {
    console.error("Error clearing todos:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE single todo
router.delete("/:id", auth, async (req, res) => {
  try {
    await Todo.findOneAndDelete({ _id: req.params.id, user: req.user });
    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

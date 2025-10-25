const mongoose = require("mongoose");

// Define the Todo structure (schema)
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,      // ✅ new field
    default: Date.now,
  },
  category: {
    type: String,
    default: "General",  // ✅ new field
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
});

// Create a model (collection)
const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;

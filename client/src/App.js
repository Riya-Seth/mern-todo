import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Sun, Moon, User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import Signup from "./components/Signup";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [newCategory, setNewCategory] = useState("General"); // category for new task
  const [filterCategory, setFilterCategory] = useState("All"); // category filter
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [streak, setStreak] = useState(() => {
    const rawUser = JSON.parse(localStorage.getItem("user") || "{}");
    return Number(localStorage.getItem("streak")) || rawUser.streak || 0;
  });
  const [avatarOptions, setAvatarOptions] = useState([]);
  const [changingAvatar, setChangingAvatar] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // fetch todos (protected)
  const fetchTodos = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/todos`, {
        headers: { Authorization: token },
      });
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
      // if unauthorized, clear token
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchTodos();
  }, [token, fetchTodos]);

  // fetch user XP, level, streak
  const fetchUserStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/todos/user/xp`, {
        headers: { Authorization: token },
      });
      // server should return { xp, level, streak } - fallback to 0
      setUserXP(res.data.xp ?? 0);
      setUserLevel(res.data.level ?? 1);
      const s = res.data.streak ?? Number(localStorage.getItem("streak")) ?? user.streak ?? 0;
      setStreak(s);
      localStorage.setItem("streak", s);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  }, [token, user.streak]);

  useEffect(() => {
    if (token) fetchUserStats();
  }, [token, fetchUserStats]);

  // Add a new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return toast.warn("Enter a task first!");
    try {
      const res = await axios.post(
        `${API_URL}/api/todos`,
        { text: newTodo, category: newCategory },
        { headers: { Authorization: token } }
      );
      setTodos((prev) => [...prev, res.data]);
      setNewTodo("");
      setNewCategory("General"); // reset add dropdown
      toast.success("Task added!");
      // no XP change here; no need to refetch stats unless server does something
    } catch (err) {
      console.error(err);
      toast.error("Failed to add task!");
    }
  };

  // Toggle complete (server awards XP/streak)
  const toggleTodo = async (id) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/todos/${id}`,
        {},
        { headers: { Authorization: token } }
      );
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      // refresh user stats because server may have updated XP/streak
      await fetchUserStats();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // Delete single todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/todos/${id}`, {
        headers: { Authorization: token },
      });
      setTodos((prev) => prev.filter((t) => t._id !== id));
      toast.error("Task removed");
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Quick actions (clear completed, delete all) — call backend when available
  const clearCompleted = async () => {
    // Remove locally (if backend route implemented you can call it)
    const remaining = todos.filter((t) => !t.completed);
    setTodos(remaining);
    toast.info("Cleared completed tasks");
    // optionally call backend to persist (not included here)
  };

  const deleteAll = async () => {
    try {
      await axios.delete(`${API_URL}/api/todos/all`, {
        headers: { Authorization: token },
      });
      setTodos([]);
      toast.error("Deleted all tasks");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete all");
    }
  };
  // 🎨 Generate new avatar options
const generateAvatars = () => {
  const seeds = ["Luna", "Nova", "Kai", "Echo", "Zephyr", "Milo", "Raya", "Orion", "Ivy"];
  const randomAvatars = Array.from({ length: 6 }, () => {
    const seed = seeds[Math.floor(Math.random() * seeds.length)];
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
    });
    setAvatarOptions(randomAvatars);
    setChangingAvatar(true);
  };
  // 🖼️ Update avatar in backend + localStorage
const updateAvatar = async (newAvatar) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/auth/users/avatar`,
      { avatar: newAvatar },
      { headers: { Authorization: token } }
    );
    const updatedUser = res.data.user;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success("Avatar updated!");
    setChangingAvatar(false);
    window.location.reload(); // refresh to apply across UI
  } catch (err) {
    console.error("Error updating avatar:", err);
    toast.error("Failed to update avatar");
  }
};

  // Logout
  const handleLogout = () => {
    toast.info("Logged out!");
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("streak");
      window.location.reload();
    }, 800);
  };

  // Auth view
  if (!token) {
    return showLogin ? (
      <Login
        onLoginSuccess={() => window.location.reload()}
        onSwitchToSignup={() => setShowLogin(false)}
      />
    ) : (
      <Signup onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  // Stats and filtered list
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const visibleTodos = filterCategory === "All" ? todos : todos.filter((t) => t.category === filterCategory);

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* NAV */}
      <nav className="navbar navbar-dark bg-dark px-3 d-flex justify-content-between align-items-center">
        <h4 className="navbar-brand m-0">
          <i className="bi bi-lightning-charge-fill me-2 text-info"></i>AchieveIt
        </h4>
        <div className="d-flex align-items-center gap-3">
          <img
            src={
              user.avatar ||
              `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
                user.username || "User"
              )}`
            }
            alt="avatar"
            className="rounded-circle"
            width="35"
            height="35"
            style={{ border: "2px solid #00c3ff" }}
          />
          <span className="text-light fw-semibold">
            {user.username || "User"} | XP: {userXP} | Level: {userLevel}
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-outline-info btn-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <User size={18} />
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="profile text-center">
      <img
        src={
          user.avatar ||
          `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
            user.username || "User"
          )}`
        }
        alt="profile"
        className="rounded-circle mb-2 border border-info shadow-sm"
        width="85"
        height="85"
      />
      <h5 className="fw-semibold text-info">{user.username}</h5>
      <p className="small text-secondary mb-1">XP: {userXP} | Level: {userLevel}</p>
      <p className="small text-warning">🔥 Streak: {streak} days</p>

      {/* ✨ Change Avatar Button */}
      {!changingAvatar ? (
        <button
          className="btn btn-outline-info btn-sm mt-2"
          onClick={generateAvatars}
        >
          Change Avatar
        </button>
      ) : (
        <div className="mt-3">
          <p className="small text-muted">Choose your new avatar:</p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {avatarOptions.map((avt, index) => (
              <img
                key={index}
                src={avt}
                alt="avatar"
                width="50"
                height="50"
                onClick={() => updateAvatar(avt)}
                className="rounded-circle border border-2 border-secondary"
                style={{ cursor: "pointer", transition: "0.2s" }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "#00c3ff")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "gray")}
              />
            ))}
          </div>
          <button
            className="btn btn-outline-secondary btn-sm mt-2"
            onClick={() => setChangingAvatar(false)}
          >
            Cancel
            </button>
              </div>
            )}
          </div>


        <hr />

        <div className="sidebar-section">
          <h6 className="text-warning mb-2">📂 Categories</h6>
          <ul className="list-unstyled">
            {["All", "General", "Work", "Personal", "College"].map((cat) => (
              <li key={cat} className={`category-item ${cat === filterCategory ? "active" : ""}`} onClick={() => setFilterCategory(cat)}>
                {cat}
              </li>
            ))}
          </ul>
        </div>

        <hr />

        <div className="sidebar-section">
          <h6 className="text-warning mb-2">📊 Productivity</h6>
          <ul className="list-unstyled small">
            <li>✅ Completed: {completedTasks}</li>
            <li>⏳ Pending: {pendingTasks}</li>
            <li>🧩 Total: {totalTasks}</li>
          </ul>
        </div>

        <hr />

        <div className="sidebar-section">
          <h6 className="text-warning mb-2">⚙️ Quick Actions</h6>
          <button className="btn btn-outline-success btn-sm w-100 mb-2" onClick={clearCompleted}>Clear Completed</button>
          <button className="btn btn-outline-danger btn-sm w-100" onClick={deleteAll}>Delete All Tasks</button>
        </div>
      </div>

      {/* MAIN */}
      <main className="main-content container py-4">
        <h3 className="fw-bold text-info text-center mb-4">Today's To-Do List</h3>

        {/* Add Task row: uses newCategory for add, filterCategory for filtering */}
        <div className="task-input-row shadow-sm">
          <input type="text" className="form-control" placeholder="Add a new task..." value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
          <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="College">College</option>
          </select>
          <button className="btn btn-primary" onClick={addTodo}>Add</button>
        </div>

        {/* Progress & stats */}
        <div className="progress my-3" style={{ height: "8px" }}>
          <div className="progress-bar bg-info" style={{ width: `${completionRate}%` }}></div>
        </div>
        <p className="text-secondary small text-center">{completedTasks}/{totalTasks} tasks completed ({completionRate}%)</p>

        {/* Task list */}
        <ul className="list-group shadow-sm">
          {visibleTodos.length === 0 && <li className="list-group-item text-center text-muted">No tasks yet! Add one above 👆</li>}
          {visibleTodos.map((todo) => (
            <li key={todo._id} className={`list-group-item d-flex justify-content-between align-items-center ${todo.completed ? "list-group-item-success" : ""}`}>
              <div>
                <input type="checkbox" className="form-check-input me-2" checked={todo.completed} onChange={() => toggleTodo(todo._id)} />
                {todo.text}
                <span className="badge bg-secondary ms-2">{todo.category}</span>
              </div>
              <button className="btn btn-outline-danger btn-sm" onClick={() => deleteTodo(todo._id)}><i className="bi bi-x-lg"></i></button>
            </li>
          ))}
        </ul>
      </main>

      <ToastContainer theme={darkMode ? "dark" : "light"} />
    </div>
  );
}

export default App;

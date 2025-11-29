import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [priority, setPriority] = useState(1);
  const navigate = useNavigate();
  const [editId, setEditId] = useState(0); // 0 means "Create Mode"
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const API_URL = import.meta.env.VITE_API_URL;
  // --- 1. FETCH (Read) ---
  const fetchTodos = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const params = new URLSearchParams();
      if (filter === "completed") params.append("completed", "true");
      else if (filter === "pending") params.append("completed", "false");

      if (priorityFilter !== "all") params.append("priority", priorityFilter);

      const response = await axios.get(`${API_URL}/todos`, {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(response.data);
    } catch (err) {
      setError("Failed to load tasks. Please login again.");
      navigate("/");
    }
  };
  useEffect(() => {
    fetchTodos();
  }, [navigate, filter, priorityFilter]);

  // --- 3. UPDATE (Toggle Completed) ---
  const toggleStatus = async (todo) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${API_URL}/todos/${todo.id}`,
        { completed: !todo.completed }, // Flip the status!
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the list instantly without refreshing
      setTodos(todos.map((t) => (t.id === todo.id ? response.data : t)));
    } catch (err) {
      setError("Failed to update task.");
    }
  };

  const handleEdit = (todo) => {
    setEditId(todo.id); // 1. Switch to Edit Mode for this ID
    setTitle(todo.title); // 2. Fill the title box
    setDescription(todo.description); // 3. Fill the description box
    setPriority(todo.priority || 1); // 4. Fill the priority box
  };

  // 2. CANCEL EDIT MODE
  const cancelEdit = () => {
    setEditId(0);
    setTitle("");
    setDescription("");
    setPriority(1);
  };

  // 3. THE TRAFFIC COP (Create vs Update)
  const saveTodo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editId === 0) {
        // --- CREATE MODE (POST) ---
        await axios.post(
          `${API_URL}/todos`,
          { title, description, priority },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchTodos();
      } else {
        // --- UPDATE MODE (PUT) ---
        await axios.put(
          `${API_URL}/todos/${editId}`,
          { title, description, priority },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update the list instantly
        await fetchTodos();
        setEditId(0); // Reset mode back to "Create"
      }

      // Clear form in both cases
      setTitle("");
      setDescription("");
      setPriority(1);
    } catch (err) {
      setError("Failed to save task.");
    }
  };

  // --- 4. DELETE ---
  const deleteTodo = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API_URL}/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the item from our list memory
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      setError("Failed to delete task.");
    }
  };

  // --- 5. LOGOUT ---

  const handleLogout = () => {
    localStorage.removeItem("token"); //1. Destroy the auth token
    navigate("/"); //2. Redirect to login page
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 3:
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            High
          </span>
        );
      case 2:
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Medium
          </span>
        );
      case 1:
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Low
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            None
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Just Do It 🚀</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form
          onSubmit={saveTodo}
          className="mb-8 bg-white p-4 rounded shadow-md flex flex-col gap-4"
        >
          <input
            type="text"
            className="p-2 border border-gray-300 rounded"
            placeholder="Title (e.g., Buy Groceries)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="p-2 border border-gray-300 rounded"
            placeholder="Description (Optional details...)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
          />
          {/* PRIORITY SELECTION */}
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="1">Low Priority 🟢</option>
            <option value="2">Medium Priority 🟡</option>
            <option value="3">High Priority 🔴</option>
          </select>
          <div className="flex gap-2">
            {/* The Submit Button changes color and text! */}
            <button
              type="submit"
              className={`px-6 py-2 rounded text-white transition ${
                editId === 0
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {editId === 0 ? "Add Task" : "Save Changes"}
            </button>

            {/* Show a Cancel button only when editing */}
            {editId !== 0 && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="flex justify-end mb-4">
          {/* NEW: Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="3">High 🔴</option>
            <option value="2">Medium 🟡</option>
            <option value="1">Low 🟢</option>
          </select>

          {/* EXISTING: Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="grid gap-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                {/* CHECKBOX FOR UPDATE */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleStatus(todo)}
                  className="w-5 h-5 cursor-pointer"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-xl font-semibold ${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.title}
                    </h3>

                    {/* NEW: The Badge Function Call 🏷️ */}
                    {getPriorityBadge(todo.priority)}
                  </div>
                  {todo.description && (
                    <p className="text-gray-600 mt-1">{todo.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {/* NEW EDIT BUTTON */}
                <button
                  onClick={() => handleEdit(todo)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition text-sm"
                >
                  Edit ✏️
                </button>
                {/* DELETE BUTTON */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                >
                  Delete 🗑️
                </button>
              </div>
            </div>
          ))}

          {todos.length === 0 && (
            <p className="text-gray-500 text-center">
              No tasks yet. Time to relax! 🏝️
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TodoList;

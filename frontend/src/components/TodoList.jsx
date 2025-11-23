import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [editId, setEditId] = useState(0); // 0 means "Create Mode"
  const API_URL = import.meta.env.VITE_API_URL;
  // --- 1. FETCH (Read) ---
  useEffect(() => {
    const fetchTodos = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/todos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos(response.data);
      } catch (err) {
        setError("Failed to load tasks. Please login again.");
        navigate("/");
      }
    };
    fetchTodos();
  }, [navigate]);

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
  };

  // 2. CANCEL EDIT MODE
  const cancelEdit = () => {
    setEditId(0);
    setTitle("");
    setDescription("");
  };

  // 3. THE TRAFFIC COP (Create vs Update)
  const saveTodo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editId === 0) {
        // --- CREATE MODE (POST) ---
        const response = await axios.post(
          `${API_URL}/todos`,
          { title, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTodos([...todos, response.data]);
      } else {
        // --- UPDATE MODE (PUT) ---
        const response = await axios.put(
          `${API_URL}/todos/${editId}`,
          { title, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update the list instantly
        setTodos(todos.map((t) => (t.id === editId ? response.data : t)));
        setEditId(0); // Reset mode back to "Create"
      }

      // Clear form in both cases
      setTitle("");
      setDescription("");
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Todos 📝</h1>

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
                  <h3
                    className={`text-xl font-semibold ${
                      todo.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {todo.title}
                  </h3>
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

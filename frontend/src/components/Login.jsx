import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // This is our "Redirect" tool

  const handleLogin = async (e) => {
    e.preventDefault(); // Stop the page from refreshing
    setError("");

    try {
      // 1. Send the "Order" to the Chef (Backend)
      // Note: This URL must match your FastAPI address!
      const response = await axios.post("http://127.0.0.1:8000/auth/login", {
        email: email,
        password: password,
      });

      // 2. Check the response
      console.log("Login Successful:", response.data);

      // 3. Save the "Key" (Token) in local storage
      // Your backend returns: { "access token": "...", "token_type": "bearer" }
      localStorage.setItem("token", response.data["access token"]);

      // 4. Navigate to the Todo Dashboard (we'll build this next)
      // For now, we'll just go to a placeholder route
      navigate("/todos");
    } catch (err) {
      console.error("Login Failed:", err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

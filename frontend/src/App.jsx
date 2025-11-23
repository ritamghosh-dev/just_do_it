import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import TodoList from "./components/TodoList";
import Register from "./components/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: The Login Page (Default) */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Route 2: The Dashboard (Placeholder for now) */}
        <Route path="/todos" element={<TodoList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchMe } from "./Features/auth/authSlice";
import { API_URL } from "./api/client";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import BookingPage from "./pages/BookingPage";
import BookingConfirmation from "./pages/BookingConfirmation";


import SpacesPage from "./pages/SpacesPage";
import SpaceDetailPage from "./pages/SpaceDetailPage";
import MyBookings from "./pages/MyBookings";
import Invoice from "./pages/Invoice";

function Home() {
  const { user, token } = useSelector((s) => s.auth);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error("API not reachable");
        return res.json();
      })
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Spacer</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {health && (
        <div>
          <p>API Status: {health.status}</p>
          <p>Message: {health.message}</p>
        </div>
      )}
      {user && <p>Logged in as: {user.email}</p>}
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      <nav
        style={{
          background: "#1a1a1a",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              color: isActive ? "#4CAF50" : "white",
              textDecoration: "none",
              fontWeight: isActive ? "bold" : "normal",
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/spaces"
            style={({ isActive }) => ({
              color: isActive ? "#4CAF50" : "white",
              textDecoration: "none",
              fontWeight: isActive ? "bold" : "normal",
            })}
          >
            Spaces
          </NavLink>
          {user && (
            <NavLink
              to="/my-bookings"
              style={({ isActive }) => ({
                color: isActive ? "#4CAF50" : "white",
                textDecoration: "none",
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              My Bookings
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink
              to="/admin/users"
              style={({ isActive }) => ({
                color: isActive ? "#4CAF50" : "white",
                textDecoration: "none",
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              Admin Users
            </NavLink>
          )}
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ color: "white" }}>
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "0.5rem 1rem",
                  border: "1px solid white",
                  borderRadius: "4px",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  background: "#4CAF50",
                  color: "white",
                  textDecoration: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailPage />} />
        <Route
          path="/spaces/:id/book"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-confirmation/:bookingId"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice/:bookingId"
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

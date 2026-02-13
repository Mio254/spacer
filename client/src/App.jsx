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
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Spacer</h1>
        <p className="mt-1 text-gray-600">Space booking demo (Vite + React + Flask + JWT)</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">Backend health</div>
            {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
            {health ? (
              <pre className="mt-2 overflow-auto rounded-lg bg-white p-3 text-xs text-gray-800">
                {JSON.stringify(health, null, 2)}
              </pre>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Checking backend connection…</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">Auth</div>
            {token ? (
              <pre className="mt-2 overflow-auto rounded-lg bg-white p-3 text-xs text-gray-800">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Not logged in.</p>
            )}
            <div className="mt-3 flex gap-2">
              <Link to="/spaces" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Browse spaces
              </Link>
              {!token && (
                <Link to="/login" className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-semibold ${
          isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) dispatch(fetchMe());
  }, [dispatch, token, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-2 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gray-900 text-white font-black">S</div>
            <span className="text-lg font-bold text-gray-900">Spacer</span>
          </Link>

          <nav className="flex flex-1 items-center gap-2">
            <NavItem to="/spaces">Spaces</NavItem>
            {token && <NavItem to="/bookings">My Bookings</NavItem>}
            {user?.role === "admin" && <NavItem to="/admin/users">Admin</NavItem>}
          </nav>

          <div className="flex items-center gap-2">
            {!token ? (
              <>
                <Link to="/login" className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Register
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={["client", "admin"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices/:id"
          element={
            <ProtectedRoute roles={["client", "admin"]}>
              <Invoice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute roles={["client", "admin"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/confirmation"
          element={
            <ProtectedRoute roles={["client", "admin"]}>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div className="mx-auto max-w-6xl p-6 text-gray-700">Not Found</div>} />
      </Routes>
    </div>
  );
}

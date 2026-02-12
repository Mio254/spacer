// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchMe } from "./features/auth/authSlice";

import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import SpacesPage from "./pages/SpacesPage";
import SpaceDetailPage from "./pages/SpaceDetailPage";
import MyBookings from "./pages/MyBookings";
import BookingPage from "./pages/BookingPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import Invoice from "./pages/Invoice";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSpaces from "./pages/admin/AdminSpaces";
import AdminBookings from "./pages/admin/AdminBookings";

function Home() {
  const { token } = useSelector((s) => s.auth);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <h1 className="text-4xl font-extrabold text-gray-900 md:text-5xl">
          Find and book spaces with ease.
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Explore, book, and manage spaces for meetings, collaboration, and celebration.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/spaces"
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
          >
            Browse spaces
          </Link>

          {!token ? (
            <>
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Sign in
              </Link>
            </>
          ) : (
            <Link
              to="/bookings"
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              My bookings
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${
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
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gray-900 text-white font-black">
              S
            </div>
            <span className="text-lg font-bold text-gray-900">Spacer</span>
          </Link>

          <nav className="flex flex-1 items-center gap-2">
            <NavItem to="/spaces">Spaces</NavItem>
            {token && <NavItem to="/bookings">My Bookings</NavItem>}
            {user?.role === "admin" && <NavItem to="/admin">Admin</NavItem>}
          </nav>

          <div className="flex items-center gap-2">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Get started
                </Link>
              </>
            ) : (
              <button
                onClick={() => dispatch(logout())}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailPage />} />

        <Route
          path="/login"
          element={token ? <Navigate to="/spaces" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/spaces" replace /> : <Register />}
        />

        {/* Client Protected */}
        <Route
          path="/checkout/:bookingId"
          element={
            <ProtectedRoute roles={["client", "admin"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={["client", "admin"]}>
              <MyBookings />
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
          path="/bookings/:id/confirmation"
          element={
            <ProtectedRoute roles={["client", "admin"]}>
              <BookingConfirmation />
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

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/spaces"
          element={
            <AdminRoute>
              <AdminSpaces />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="mx-auto max-w-6xl p-6 text-gray-700">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-bold text-gray-900">Not Found</div>
                <p className="mt-2 text-sm text-gray-600">
                  That page doesn’t exist. Go back{" "}
                  <Link to="/" className="font-semibold text-blue-600 hover:underline">
                    home
                  </Link>.
                </p>
              </div>
            </div>
          }
        />
      </Routes>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-gray-500">
        © {new Date().getFullYear()} Spacer
      </footer>
    </div>
  );
}

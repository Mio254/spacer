import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (login.fulfilled.match(res)) navigate("/spaces", { replace: true });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-600">Log in to book spaces and view your bookings.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={status === "loading"}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {status === "loading" ? "Signing in..." : "Login"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <p className="mt-4 text-sm text-gray-600">
          No account?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

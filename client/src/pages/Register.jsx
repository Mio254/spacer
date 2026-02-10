import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const res = await dispatch(register({ email, password, full_name }));
    if (register.fulfilled.match(res)) navigate("/spaces", { replace: true });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-1 text-sm text-gray-600">Register to start booking spaces.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Full name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Michael Ogato"
              autoComplete="name"
            />
          </div>

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
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </div>

          <button
            disabled={status === "loading"}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {status === "loading" ? "Creating..." : "Register"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

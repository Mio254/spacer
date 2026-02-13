import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, loginWithFirebase } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";

import { signInWithPopup } from "firebase/auth";
import { fbAuth, googleProvider } from "../firebase";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [socialError, setSocialError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (login.fulfilled.match(res)) navigate("/spaces", { replace: true });
  }

  async function onGoogleLogin() {
    setSocialError(null);
    try {
      const result = await signInWithPopup(fbAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await dispatch(loginWithFirebase({ id_token: idToken }));
      if (loginWithFirebase.fulfilled.match(res)) {
        navigate("/spaces", { replace: true });
      } else {
        setSocialError(res.payload || "Google login failed");
      }
    } catch (e) {
      setSocialError(e?.message || "Google login failed");
    }
  }

  const busy = status === "loading";

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-600">Log in to book spaces and view your bookings.</p>

        {/* Google Login */}
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={busy}
          className="mt-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Continue with Google"}
        </button>

        {socialError && <p className="mt-2 text-sm text-red-600">{socialError}</p>}

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Login"}
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

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, loginWithFirebase } from "../Features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";

import { signInWithPopup } from "firebase/auth";
import { fbAuth, googleProvider } from "../firebase";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [socialError, setSocialError] = useState(null);

  const busy = status === "loading";

  async function onSubmit(e) {
    e.preventDefault();
    const res = await dispatch(register({ email, password, full_name }));
    if (register.fulfilled.match(res)) navigate("/spaces", { replace: true });
  }

  async function onGoogleRegister() {
    setSocialError(null);
    try {
      const result = await signInWithPopup(fbAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await dispatch(loginWithFirebase({ id_token: idToken }));
      if (loginWithFirebase.fulfilled.match(res)) {
        navigate("/spaces", { replace: true });
      } else {
        setSocialError(res.payload || "Google sign-up failed");
      }
    } catch (e) {
      setSocialError(e?.message || "Google sign-up failed");
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        <p className="mt-1 text-sm text-gray-600">Register to book spaces and manage bookings.</p>

        <button
          type="button"
          onClick={onGoogleRegister}
          disabled={busy}
          className="mt-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          {busy ? "Signing up..." : "Continue with Google"}
        </button>

        {socialError && <p className="mt-2 text-sm text-red-600">{socialError}</p>}

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Full name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Demo User"
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
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Creating..." : "Register"}
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

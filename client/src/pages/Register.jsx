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
    if (register.fulfilled.match(res)) {
      navigate("/", { replace: true });
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Register</h2>

      <form onSubmit={onSubmit}>
        <label>Full name</label>
        <input value={full_name} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%" }} />

        <label style={{ display: "block", marginTop: 12 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />

        <label style={{ display: "block", marginTop: 12 }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />

        <button disabled={status === "loading"} style={{ marginTop: 16 }}>
          {status === "loading" ? "Creating..." : "Register"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

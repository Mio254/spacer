import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import { setAuth } from "../features/auth/authSlice";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [err, setErr] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: { full_name: fullName, email, password, role },
      });
      dispatch(setAuth({ token: data.token, user: data.user }));
      navigate("/");
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Register</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <form onSubmit={onSubmit}>
        <label>Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%" }} />
        <br /><br />

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        <br /><br />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
        <br /><br />

        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%" }}>
          <option value="client">client</option>
          <option value="admin">admin</option>
        </select>
        <br /><br />

        <button type="submit">Create account</button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

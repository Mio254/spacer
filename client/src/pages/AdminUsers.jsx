import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../api/api";

export default function AdminUsers() {
  const { token } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api
      .request("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(setUsers)
      .catch((e) => setErr(e.message));
  }, [token]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin: Users</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

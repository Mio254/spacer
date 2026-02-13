import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/client";

export default function AdminUsers() {
  const { token } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!token) return;
    setStatus("loading");
    apiFetch("/api/admin/users", { token })
      .then((data) => {
        setUsers(data.users || []);
        setStatus("succeeded");
      })
      .catch((e) => {
        setErr(e.message);
        setStatus("failed");
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Admin: Users</h2>
        <p className="mt-1 text-sm text-gray-600">Manage users and roles.</p>
      </div>

      {status === "loading" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm">
          Loading users…
        </div>
      )}

      {status === "failed" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error: {err}
        </div>
      )}

      {status === "succeeded" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <div className="col-span-2">ID</div>
            <div className="col-span-4">Full name</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Role</div>
          </div>

          <ul className="divide-y">
            {users.map((u) => (
              <li key={u.id} className="grid grid-cols-12 gap-2 px-4 py-4 text-sm text-gray-800">
                <div className="col-span-2 font-medium">{u.id}</div>
                <div className="col-span-4">{u.full_name || "—"}</div>
                <div className="col-span-4">{u.email}</div>
                <div className="col-span-2">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                    {u.role}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

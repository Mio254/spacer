import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { adminApi } from "../../api/admin";
import { Link } from "react-router-dom";

export default function AdminUsers() {
  const { token } = useSelector((s) => s.auth);

  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // create user form
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await adminApi.users(token);
        if (!alive) return;
        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load users");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
  }, [users]);

  async function patchUser(id, body) {
    const prev = users;
    setUsers((cur) => cur.map((u) => (u.id === id ? { ...u, ...body } : u)));
    try {
      const res = await adminApi.patchUser(token, id, body);
      const updated = res?.user;
      if (updated) setUsers((cur) => cur.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      setUsers(prev);
      setErr(e?.message || "Failed to update user");
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setErr("");
    try {
      const res = await adminApi.createUser(token, {
        email,
        password,
        full_name: fullName,
        role,
      });
      const created = res?.user;
      if (created) setUsers((cur) => [created, ...cur]);
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("client");
    } catch (e2) {
      setErr(e2?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin • Users</h1>
          <p className="mt-1 text-sm text-gray-600">Create users, assign roles, disable accounts.</p>
        </div>
        <Link to="/admin" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100">
          Back
        </Link>
      </div>

      {err && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Create user */}
      <form onSubmit={handleCreate} className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-bold text-gray-900">Create user</div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            placeholder="Full name (optional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            placeholder="Password (min 8, letters+numbers)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="client">client</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create user"}
          </button>
        </div>
      </form>

      {/* Users table */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="col-span-5">User</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2 text-center">Active</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {sorted.map((u) => (
              <div key={u.id} className="grid grid-cols-12 items-center gap-3 px-4 py-4">
                <div className="col-span-12 md:col-span-5">
                  <div className="font-semibold text-gray-900">{u.full_name || "—"}</div>
                  <div className="mt-1 text-xs text-gray-600">{u.email}</div>
                </div>

                <div className="col-span-6 md:col-span-3">
                  <select
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    value={u.role || "client"}
                    onChange={(e) => patchUser(u.id, { role: e.target.value })}
                  >
                    <option value="client">client</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <div className="col-span-3 md:col-span-2 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.is_active ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="col-span-3 md:col-span-2 text-right">
                  <button
                    type="button"
                    onClick={() => patchUser(u.id, { is_active: !u.is_active })}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    {u.is_active ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

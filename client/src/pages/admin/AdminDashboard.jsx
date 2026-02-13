import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { adminApi } from "../../api/admin";

export default function AdminDashboard() {
  const { token } = useSelector((s) => s.auth);
  const [stats, setStats] = useState({ users: 0, spaces: 0, bookings: 0 });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        setLoading(true);

        const [u, s, b] = await Promise.all([
          adminApi.users(token),
          adminApi.spaces(token),
          adminApi.bookings(token),
        ]);

        if (!alive) return;

        setStats({
          users: (u?.users || []).length,
          spaces: (s?.spaces || []).length,
          bookings: (b?.bookings || []).length,
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load admin dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin</h1>
          <p className="mt-1 text-sm text-gray-600">Manage users, spaces, and bookings.</p>
        </div>

        <div className="flex gap-2">
          <Link to="/admin/users" className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            Users
          </Link>
          <Link to="/admin/spaces" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100">
            Spaces
          </Link>
          <Link to="/admin/bookings" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100">
            Bookings
          </Link>
        </div>
      </div>

      {err && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-600">Users</div>
            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.users}</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-600">Spaces</div>
            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.spaces}</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-600">Bookings</div>
            <div className="mt-2 text-3xl font-extrabold text-gray-900">{stats.bookings}</div>
          </div>
        </div>
      )}
    </div>
  );
}

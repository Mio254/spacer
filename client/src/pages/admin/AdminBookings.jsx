import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { adminApi } from "../../api/admin";
import { Link } from "react-router-dom";

function fmt(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default function AdminBookings() {
  const { token } = useSelector((s) => s.auth);

  const [bookings, setBookings] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await adminApi.bookings(token);
        if (!alive) return;
        setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load bookings");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [token]);

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [bookings]);

  async function setStatus(id, status) {
    const prev = bookings;
    setBookings((cur) => cur.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      const res = await adminApi.patchBooking(token, id, { status });
      const updated = res?.booking;
      if (updated) setBookings((cur) => cur.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    } catch (e) {
      setBookings(prev);
      setErr(e?.message || "Failed to update booking");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin • Bookings</h1>
          <p className="mt-1 text-sm text-gray-600">Audit and manage booking statuses.</p>
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

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="col-span-4">Space</div>
            <div className="col-span-3">Time</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {sorted.map((b) => (
              <div key={b.id} className="grid grid-cols-12 items-center gap-3 px-4 py-4">
                <div className="col-span-12 md:col-span-4">
                  <div className="font-semibold text-gray-900">{b.space_name || `Space #${b.space_id}`}</div>
                  <div className="mt-1 text-xs text-gray-600">Booking ID: {b.id} • User: {b.user_id}</div>
                </div>

                <div className="col-span-12 md:col-span-3 text-sm text-gray-800">
                  {fmt(b.start_time)} → {fmt(b.end_time)}
                </div>

                <div className="col-span-6 md:col-span-2 md:text-right text-sm font-semibold text-gray-900">
                  KES {Number(b.total_cost || 0).toLocaleString("en-KE")}
                </div>

                <div className="col-span-6 md:col-span-1 text-center">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                    {String(b.status || "").toUpperCase()}
                  </span>
                </div>

                <div className="col-span-12 md:col-span-2 md:text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setStatus(b.id, "confirmed")}
                      className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(b.id, "cancelled")}
                      className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

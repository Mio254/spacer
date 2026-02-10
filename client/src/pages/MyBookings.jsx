import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/client";

export default function MyBookings() {
  const { token } = useSelector((s) => s.auth);

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setStatus("loading");
    setError(null);

    apiFetch("/api/bookings/me", { token })
      .then((data) => {
        setItems(data.bookings || []);
        setStatus("succeeded");
      })
      .catch((e) => {
        setError(e.message);
        setStatus("failed");
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-1 text-sm text-gray-600">Your recent bookings and totals.</p>
      </div>

      {!token && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm">
          Please log in to see your bookings.
        </div>
      )}

      {token && status === "loading" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm">
          Loading bookings…
        </div>
      )}

      {token && status === "failed" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error: {error}
        </div>
      )}

      {token && status === "succeeded" && items.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm">
          You don’t have any bookings yet.
        </div>
      )}

      {token && status === "succeeded" && items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <div className="col-span-2">Booking</div>
            <div className="col-span-4">Space</div>
            <div className="col-span-3">Start</div>
            <div className="col-span-3">End</div>
          </div>

          <ul className="divide-y">
            {items.map((b) => (
              <li key={b.id} className="grid grid-cols-12 gap-2 px-4 py-4 text-sm text-gray-800">
                <div className="col-span-2 font-semibold">#{b.id}</div>
                <div className="col-span-4">
                  <div className="font-semibold">{b.space_name || `Space #${b.space_id}`}</div>
                  {b.location && <div className="text-xs text-gray-500">📍 {b.location}</div>}
                  {b.total_cost != null && (
                    <div className="mt-1 text-xs font-semibold text-gray-700">KSH {b.total_cost}</div>
                  )}
                </div>
                <div className="col-span-3">{fmt(b.start_date)}</div>
                <div className="col-span-3">{fmt(b.end_date)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function fmt(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

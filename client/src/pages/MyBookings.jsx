import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/client";

function PaymentBadge({ status }) {
  const s = String(status || "unpaid").toLowerCase();
  const paid = s === "paid";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
        paid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700",
      ].join(" ")}
      title={paid ? "Payment received" : "Payment pending"}
    >
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

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

  const totals = useMemo(() => {
    const totalBookings = items.length;
    const paidCount = items.filter((b) => String(b.payment_status).toLowerCase() === "paid").length;
    const unpaidCount = totalBookings - paidCount;
    const totalSpend = items.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0);
    return { totalBookings, paidCount, unpaidCount, totalSpend };
  }, [items]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-600">Your recent bookings and payment status.</p>
        </div>

        {token && status === "succeeded" && (
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              Total: {totals.totalBookings}
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Paid: {totals.paidCount}
            </span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              Unpaid: {totals.unpaidCount}
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Spend: KSH {totals.totalSpend}
            </span>
          </div>
        )}
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
            <div className="col-span-2">Payment</div>
            <div className="col-span-2">Start</div>
            <div className="col-span-2">End</div>
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

                <div className="col-span-2">
                  <PaymentBadge status={b.payment_status} />
                </div>

                
                <div className="col-span-2">{fmt(b.start_time)}</div>
                <div className="col-span-2">{fmt(b.end_time)}</div>
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

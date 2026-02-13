// client/src/pages/MyBookings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/client";

function fmt(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatRange(b) {
  const start = b.start_time || b.start_date || b.start || b.from;
  const end = b.end_time || b.end_date || b.end || b.to;
  if (!start && !end) return "—";
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  return fmt(start || end);
}

const money = (n) =>
  n == null || n === "" || Number.isNaN(Number(n))
    ? "—"
    : `KES ${Number(n).toLocaleString("en-KE")}`;

export default function MyBookings() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function loadBookings(activeToken) {
    const data = await apiFetch("/api/bookings/me", { token: activeToken });
    const list = data?.bookings || [];
    setBookings(Array.isArray(list) ? list : []);
  }

  useEffect(() => {
    let alive = true;

    if (!token) {
      setBookings([]);
      setLoading(false);
      setErr("Please log in to view your bookings.");
      return () => {
        alive = false;
      };
    }

    (async () => {
      try {
        setErr("");
        setLoading(true);
        await loadBookings(token);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load bookings");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
  }, [bookings]);

  async function handleDelete(bookingId) {
    const ok = window.confirm("Delete this booking? This cannot be undone.");
    if (!ok) return;

    setErr("");
    const prev = bookings;

    // optimistic UI
    setBookings((cur) => cur.filter((b) => b.id !== bookingId));
    setDeletingId(bookingId);

    try {
      await apiFetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        token,
      });

      // re-fetch to sync payment/invoice status
      await loadBookings(token);
    } catch (e) {
      // revert UI
      setBookings(prev);
      setErr(e?.message || "Failed to delete booking");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your bookings and payments.
          </p>
        </div>

        <Link
          to="/spaces"
          className="inline-flex w-fit rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
        >
          Book a new space
        </Link>
      </div>

      {err && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
          {!token && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="text-lg font-bold text-gray-900">No bookings yet</div>
          <p className="mt-2 text-sm text-gray-600">
            Go to Spaces and book your first one.
          </p>
          <Link
            to="/spaces"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse spaces
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="col-span-4">Space</div>
            <div className="col-span-3">Time</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1 text-center">Payment</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {sorted.map((b) => {
              const spaceName = b.space_name || `Space #${b.space_id ?? "—"}`;
              const total = b.total_cost ?? null;

              const paymentStatus = String(b.payment_status || "").toLowerCase();
              const bookingStatus = String(b.status || "").toLowerCase();

              const isPaid =
                paymentStatus === "paid" ||
                bookingStatus === "paid" ||
                Boolean(b.invoice_id);

              return (
                <div
                  key={b.id}
                  className="grid grid-cols-12 items-center gap-3 px-4 py-4"
                >
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-semibold text-gray-900">{spaceName}</div>
                    <div className="mt-1 text-xs text-gray-600">
                      Booking ID: {b.id}
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-3">
                    <div className="text-sm text-gray-800">{formatRange(b)}</div>
                    {b.duration != null && (
                      <div className="mt-1 text-xs text-gray-600">
                        Duration: {b.duration} min
                      </div>
                    )}
                  </div>

                  <div className="col-span-6 md:col-span-2 md:text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {money(total)}
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-1 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  <div className="col-span-12 md:col-span-2 md:text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {!isPaid && (
                        <Link
                          to={`/checkout/${b.id}`}
                          className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Pay
                        </Link>
                      )}

                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          disabled={deletingId === b.id}
                          className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingId === b.id ? "Deleting…" : "Delete"}
                        </button>
                      )}

                      {isPaid &&
                        (b.invoice_id ? (
                          <Link
                            to={`/invoices/${b.invoice_id}`}
                            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            View Invoice
                          </Link>
                        ) : (
                          <span className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-400">
                            Invoice pending
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
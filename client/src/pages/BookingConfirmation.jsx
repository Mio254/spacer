import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BookingConfirmation() {
  const { state } = useLocation();
  const booking = state?.booking;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-900">Booking confirmed</h2>

        {booking ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-800">Booking ID: {booking.id}</div>
            <div className="mt-2 text-sm text-gray-700">
              Space: <span className="font-semibold">{booking.space_id}</span>
            </div>
            <div className="mt-1 text-sm text-gray-700">
              From: <span className="font-semibold">{booking.start_time}</span>
            </div>
            <div className="mt-1 text-sm text-gray-700">
              To: <span className="font-semibold">{booking.end_time}</span>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              Total: <span className="font-semibold">KES {booking.total_cost}</span>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-semibold text-gray-600">
                View raw response
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-white p-3 text-xs text-gray-800 ring-1 ring-gray-200">
                {JSON.stringify(booking, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-600">
            Booking created successfully, but details aren’t available on refresh.
            Go to <Link className="font-semibold text-blue-600 hover:underline" to="/bookings">My Bookings</Link>.
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <Link
            to="/bookings"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            View my bookings
          </Link>
          <Link
            to="/spaces"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Browse spaces
          </Link>
        </div>
      </div>
    </div>
  );
}

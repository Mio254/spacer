import { Link } from "react-router-dom";

export default function BookingConfirmation() {
  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-600 text-white font-black">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Booking confirmed</h3>
            <p className="text-sm text-gray-600">
              Your booking has been created successfully.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/bookings"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View My Bookings
          </Link>
          <Link
            to="/spaces"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Browse more spaces
          </Link>
        </div>
      </div>
    </div>
  );
}

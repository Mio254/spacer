import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingForm from "../components/bookings/BookingForm";
import { spaceService } from "../services/spaceService";

export default function BookingPage() {
  const { id } = useParams(); 

  const [space, setSpace] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    setStatus("loading");
    setError(null);

    spaceService
      .getSpace(id)
      .then((data) => {
        if (!alive) return;
        const s = data?.space ?? data;
        setSpace(s);
        setStatus("succeeded");
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message);
        setStatus("failed");
      });

    return () => {
      alive = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          Loading booking page…
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error: {error}
        </div>
        <Link
          to="/spaces"
          className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to spaces
        </Link>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          Space not found.
        </div>
        <Link
          to="/spaces"
          className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to spaces
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Book: {space.name}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            📍 {space.location || "Nairobi"} • KES {space.price_per_hour}/hr
          </p>
        </div>

        <Link
          to={`/spaces/${space.id}`}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          ← Back to space
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Choose your time
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Select start/end date-time, check availability, and confirm.
            </p>

            <div className="mt-4">
              <BookingForm
                spaceId={space.id}
                pricePerHour={space.price_per_hour}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Booking notes
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
              <li>Bookings require login (JWT).</li>
              <li>Availability checks prevent overlaps.</li>
              <li>Total cost = hourly rate × duration.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
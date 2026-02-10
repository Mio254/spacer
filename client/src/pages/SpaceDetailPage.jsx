import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { spaceService } from "../services/spaceService";
import BookingForm from "../components/bookings/BookingForm";

export default function SpaceDetailPage() {
  const { id } = useParams();

  const [space, setSpace] = useState(null);
  const [status, setStatus] = useState("loading"); // loading|succeeded|failed
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus("loading");
    setError(null);

    spaceService
      .getSpace(id)
      .then((data) => {
        // If your backend returns {space: {...}}, unwrap it.
        const s = data?.space ?? data;
        setSpace(s);
        setStatus("succeeded");
      })
      .catch((e) => {
        setError(e.message);
        setStatus("failed");
      });
  }, [id]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-700">
          Loading space details...
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error: {error}
        </div>
        <Link to="/spaces" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
          ← Back to spaces
        </Link>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-700">
          Space not found.
        </div>
        <Link to="/spaces" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
          ← Back to spaces
        </Link>
      </div>
    );
  }

  const imageUrl =
    space.image_url ||
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80";

  const capacity = space.max_capacity ?? space.capacity ?? "—";

  return (
    <div className="mx-auto max-w-6xl p-4">
      <Link to="/spaces" className="mb-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
        ← Back to spaces
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative">
          <img src={imageUrl} alt={space.name} className="h-72 w-full object-cover md:h-96" />
          <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white">
            📍 {space.location || "Nairobi"}
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-3">
          {/* Left content */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900">{space.name}</h1>
            <p className="mt-2 text-gray-600">{space.description || "No description provided."}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoCard label="Hourly Rate" value={`KSH ${space.price_per_hour}/hr`} icon="💰" />
              <InfoCard label="Capacity" value={`${capacity} people`} icon="👥" />
              <InfoCard label="Hours" value={space.operating_hours || "Flexible"} icon="🕒" />
            </div>
          </div>

          {/* Booking panel */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Book this space</h2>
              <p className="mt-1 text-sm text-gray-600">
                Select start/end date-time, check availability, then confirm.
              </p>

              <div className="mt-4">
                <BookingForm spaceId={space.id} pricePerHour={space.price_per_hour} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
        <div className="text-sm font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

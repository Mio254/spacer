import { useEffect, useState } from "react";
import { spaceService } from "../services/spaceService";
import { Link } from "react-router-dom";

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus("loading");
    spaceService
      .getAllSpaces()
      .then((data) => {
        const items = data?.spaces ?? data;
        setSpaces(Array.isArray(items) ? items : []);
        setStatus("succeeded");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("failed");
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Spaces</h1>
          <p className="mt-1 text-gray-600">Browse and book workspaces, studios, meeting rooms.</p>
        </div>
      </div>

      {status === "loading" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm">
          Loading spaces…
        </div>
      )}

      {status === "failed" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error: {error}
        </div>
      )}

      {status === "succeeded" && spaces.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm">
          No spaces available yet.
        </div>
      )}

      {status === "succeeded" && spaces.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
}

function SpaceCard({ space }) {
  const img = space.image_url || "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80";
  const capacity = space.max_capacity ?? space.capacity ?? "—";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <img src={img} alt={space.name} className="h-44 w-full object-cover" />
        <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          📍 {space.location || "Nairobi"}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900">{space.name}</h3>
          <div className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
            KSH {space.price_per_hour}/hr
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {space.description || "Clean, flexible space for work and meetings."}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>👥 {capacity} people</span>
          <Link
            to={`/spaces/${space.id}`}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

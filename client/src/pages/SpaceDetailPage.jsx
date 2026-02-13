import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/client";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=60";

function Chip({ children }) {
  return (
    <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
      {children}
    </span>
  );
}

function HeaderImage({ src, alt }) {
  const [broken, setBroken] = useState(false);
  const url = !src || broken ? FALLBACK_IMG : src;

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-gray-200">
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/0" />
    </div>
  );
}

export default function SpaceDetailPage() {
  const { id } = useParams();
  const { token } = useSelector((s) => s.auth);

  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        setLoading(true);

        
        const data = await apiFetch(`/api/spaces/${id}`, { token });

        if (!alive) return;
        setSpace(data?.space || data);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load space");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-72 animate-pulse rounded-3xl border border-gray-200 bg-white" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-bold text-gray-900">Space not found</div>
          <Link
            to="/spaces"
            className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Back to spaces
          </Link>
        </div>
      </div>
    );
  }

  const price =
    space.price_per_hour != null ? `KES ${space.price_per_hour}/hr` : "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <Link
          to="/spaces"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to spaces
        </Link>

        <div className="mt-4">
          <HeaderImage src={space.image_url} alt={space.name || "Space"} />
        </div>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {space.name || "Untitled space"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {space.location || space.city || "Location not set"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {space.capacity != null && <Chip>{space.capacity} pax</Chip>}
              {space.type && <Chip>{space.type}</Chip>}
              {space.is_available != null && (
                <Chip>{space.is_available ? "Available" : "Unavailable"}</Chip>
              )}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-gray-700">
              {space.description || "No description provided."}
            </p>
          </div>

          <aside className="w-full md:w-[340px]">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Price
              </div>
              <div className="mt-1 text-2xl font-extrabold text-gray-900">
                {price}
              </div>

              <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Quick actions
              </div>

              <div className="mt-3 flex flex-col gap-2">
                
                <Link
                  to={`/spaces/${space.id}/book`}
                  className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black text-center"
                >
                  Book this space
                </Link>

                <Link
                  to="/spaces"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 text-center"
                >
                  Continue browsing
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
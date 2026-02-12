import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/client";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="text-lg font-bold text-gray-900">No spaces found</div>
      <p className="mt-2 text-sm text-gray-600">Try changing your search or filters.</p>
    </div>
  );
}

function SpaceImage({ src, alt }) {
  const [broken, setBroken] = useState(false);
  const url = !src || broken ? FALLBACK_IMG : src;

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200">
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setBroken(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
    </div>
  );
}

export default function SpacesPage() {
  const { token } = useSelector((s) => s.auth);

  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name"); // name | priceAsc | priceDesc

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // if your API base is NOT /api, use "/api/spaces"
        const data = await apiFetch("/api/spaces", { token });

        if (!alive) return;
        setSpaces(Array.isArray(data) ? data : data?.spaces || []);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load spaces");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...spaces];

    if (q) {
      list = list.filter((s) => {
        const name = (s.name || "").toLowerCase();
        const loc = (s.location || s.city || "").toLowerCase();
        const desc = (s.description || "").toLowerCase();
        return name.includes(q) || loc.includes(q) || desc.includes(q);
      });
    }

    if (sort === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sort === "priceAsc") {
      list.sort((a, b) => (a.price_per_hour ?? 0) - (b.price_per_hour ?? 0));
    } else if (sort === "priceDesc") {
      list.sort((a, b) => (b.price_per_hour ?? 0) - (a.price_per_hour ?? 0));
    }

    return list;
  }, [spaces, query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Spaces</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse available spaces and book time quickly.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <div className="relative w-full md:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, location, description…"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm outline-none hover:bg-gray-50"
          >
            <option value="name">Sort: Name</option>
            <option value="priceAsc">Sort: Price (low → high)</option>
            <option value="priceDesc">Sort: Price (high → low)</option>
          </select>
        </div>
      </div>

      {err && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-60 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="p-4">
                <SpaceImage src={s.image_url} alt={s.name || "Space"} />

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-bold text-gray-900">
                      {s.name || "Untitled space"}
                    </div>
                    <div className="mt-1 truncate text-sm text-gray-600">
                      {s.location || s.city || "Location not set"}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs font-semibold text-gray-500">From</div>
                    <div className="text-lg font-extrabold text-gray-900">
                      {s.price_per_hour != null ? `KES ${s.price_per_hour}/hr` : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {s.capacity != null && <Badge>{s.capacity} pax</Badge>}
                  {s.type && <Badge>{s.type}</Badge>}
                  {s.is_available != null && <Badge>{s.is_available ? "Available" : "Unavailable"}</Badge>}
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                  {s.description || "No description provided."}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <Link
                    to={`/spaces/${s.id}`}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    View details
                  </Link>
                  <Link
                    to={`/spaces/${s.id}`}
                    className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { adminApi } from "../../api/admin";
import { Link } from "react-router-dom";

export default function AdminSpaces() {
  const { token } = useSelector((s) => s.auth);

  const [spaces, setSpaces] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await adminApi.spaces(token);
        if (!alive) return;
        setSpaces(Array.isArray(data?.spaces) ? data.spaces : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load spaces");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [token]);

  const sorted = useMemo(() => {
    return [...spaces].sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
  }, [spaces]);

  async function toggleActive(spaceId, nextActive) {
    const prev = spaces;
    setSpaces((cur) => cur.map((s) => (s.id === spaceId ? { ...s, is_active: nextActive } : s)));
    try {
      const res = await adminApi.patchSpace(token, spaceId, { is_active: nextActive });
      const updated = res?.space;
      if (updated) setSpaces((cur) => cur.map((s) => (s.id === spaceId ? updated : s)));
    } catch (e) {
      setSpaces(prev);
      setErr(e?.message || "Failed to update space");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin • Spaces</h1>
          <p className="mt-1 text-sm text-gray-600">Enable/disable listings across the marketplace.</p>
        </div>
        <Link to="/admin" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100">
          Back
        </Link>
      </div>

      {err && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="col-span-5">Space</div>
            <div className="col-span-2">Price/hr</div>
            <div className="col-span-2">Capacity</div>
            <div className="col-span-1 text-center">Active</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {sorted.map((s) => (
              <div key={s.id} className="grid grid-cols-12 items-center gap-3 px-4 py-4">
                <div className="col-span-12 md:col-span-5">
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="mt-1 text-xs text-gray-600">{s.location || "—"}</div>
                </div>

                <div className="col-span-4 md:col-span-2 text-sm text-gray-900">
                  KES {Number(s.price_per_hour || 0).toLocaleString("en-KE")}
                </div>

                <div className="col-span-4 md:col-span-2 text-sm text-gray-900">
                  {s.capacity ?? "—"}
                </div>

                <div className="col-span-4 md:col-span-1 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      s.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.is_active ? "Yes" : "No"}
                  </span>
                </div>

                <div className="col-span-12 md:col-span-2 md:text-right">
                  <button
                    type="button"
                    onClick={() => toggleActive(s.id, !s.is_active)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    {s.is_active ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

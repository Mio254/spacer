import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { adminApi } from "../../api/admin";
import { Link } from "react-router-dom";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function AdminSpaces() {
  const { token } = useSelector((s) => s.auth);

  const [spaces, setSpaces] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    price_per_hour: "",
    capacity: "",
    max_capacity: "",
    operating_hours: "",
    image_url: "",
    is_active: true,
  });

  async function refreshSpaces() {
    setErr("");
    const data = await adminApi.spaces(token);
    setSpaces(Array.isArray(data?.spaces) ? data.spaces : []);
  }

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
    setSpaces((cur) =>
      cur.map((s) => (s.id === spaceId ? { ...s, is_active: nextActive } : s))
    );
    try {
      const res = await adminApi.patchSpace(token, spaceId, {
        is_active: nextActive,
      });
      const updated = res?.space;
      if (updated) {
        setSpaces((cur) => cur.map((s) => (s.id === spaceId ? updated : s)));
      }
    } catch (e) {
      setSpaces(prev);
      setErr(e?.message || "Failed to update space");
    }
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      location: "",
      price_per_hour: "",
      capacity: "",
      max_capacity: "",
      operating_hours: "",
      image_url: "",
      is_active: true,
    });
  }

  function closeModal() {
    setOpen(false);
    setSaving(false);
    // keep form for convenience? reset to avoid stale data:
    resetForm();
  }

  async function submitNewSpace(e) {
    e.preventDefault();
    setErr("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      location: form.location.trim() || undefined,
      image_url: form.image_url.trim() || undefined,
      operating_hours: form.operating_hours.trim() || undefined,
      // backend requires these:
      price_per_hour: toNumber(form.price_per_hour),
      capacity: toNumber(form.capacity),
      // optional:
      max_capacity:
        form.max_capacity === "" ? undefined : toNumber(form.max_capacity),
      is_active: !!form.is_active,
    };

    if (!payload.name) return setErr("Name is required");
    if (!payload.description) return setErr("Description is required");
    if (!Number.isFinite(payload.price_per_hour) || payload.price_per_hour <= 0)
      return setErr("Price per hour must be a valid number > 0");
    if (!Number.isFinite(payload.capacity) || payload.capacity <= 0)
      return setErr("Capacity must be a valid number > 0");

    try {
      setSaving(true);
      await adminApi.createSpace(token, payload);

      // Refresh list so admin view shows the new one
      await refreshSpaces();

      closeModal();
    } catch (e2) {
      setErr(e2?.message || "Failed to create space");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Admin • Spaces
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Add new spaces and enable/disable listings across the marketplace.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setErr("");
              setOpen(true);
            }}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            + Add Space
          </button>

          <Link
            to="/admin"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
          >
            Back
          </Link>
        </div>
      </div>

      {err && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
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
              <div
                key={s.id}
                className="grid grid-cols-12 items-center gap-3 px-4 py-4"
              >
                <div className="col-span-12 md:col-span-5">
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    {s.location || "—"}
                  </div>
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
                      s.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
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

            {sorted.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-600">
                No spaces found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Space Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <div className="text-lg font-extrabold text-gray-900">
                  Add Space
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Creates a new listing (admin-only).
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                disabled={saving}
              >
                Close
              </button>
            </div>

            <form onSubmit={submitNewSpace} className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="text-xs font-semibold text-gray-700">
                    Name *
                  </div>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Westlands Tech Hub"
                    required
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-gray-700">
                    Location
                  </div>
                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Westlands, Nairobi"
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="text-xs font-semibold text-gray-700">
                    Description *
                  </div>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Modern co-working space with high-speed internet..."
                    required
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-gray-700">
                    Price per hour (KES) *
                  </div>
                  <input
                    value={form.price_per_hour}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price_per_hour: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="2500"
                    inputMode="numeric"
                    required
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-gray-700">
                    Capacity *
                  </div>
                  <input
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, capacity: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="50"
                    inputMode="numeric"
                    required
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-gray-700">
                    Max capacity
                  </div>
                  <input
                    value={form.max_capacity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, max_capacity: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="50"
                    inputMode="numeric"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-gray-700">
                    Operating hours
                  </div>
                  <input
                    value={form.operating_hours}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, operating_hours: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="7:00 AM - 10:00 PM Daily"
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="text-xs font-semibold text-gray-700">
                    Image URL
                  </div>
                  <input
                    value={form.image_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image_url: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>

                <label className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-800">
                    Active immediately
                  </span>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create Space"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
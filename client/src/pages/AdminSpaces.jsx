import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/client";

export default function AdminSpaces() {
  const { token } = useSelector((s) => s.auth);
  const [spaces, setSpaces] = useState([]);
  const [status, setStatus] = useState("loading");
  const [err, setErr] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_hour: "",
    capacity: "",
    image_url: "",
    is_active: true,
  });

  const fetchSpaces = () => {
    if (!token) return;
    setStatus("loading");
    apiFetch("/api/spaces/admin", { token })
      .then((data) => {
        setSpaces(data || []);
        setStatus("succeeded");
      })
      .catch((e) => {
        setErr(e.message);
        setStatus("failed");
      });
  };

  useEffect(() => {
    fetchSpaces();
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    apiFetch("/api/spaces/admin", {
      token,
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then(() => {
        setShowForm(false);
        setFormData({
          name: "",
          description: "",
          price_per_hour: "",
          capacity: "",
          image_url: "",
          is_active: true,
        });
        fetchSpaces();
      })
      .catch((e) => setErr(e.message));
  };

  const toggleActive = (spaceId, currentActive) => {
    apiFetch(`/api/spaces/admin/${spaceId}`, {
      token,
      method: "PUT",
      body: JSON.stringify({ is_active: !currentActive }),
    })
      .then(() => fetchSpaces())
      .catch((e) => setErr(e.message));
  };

  const deleteSpace = (spaceId) => {
    if (!confirm("Are you sure you want to delete this space?")) return;
    apiFetch(`/api/spaces/admin/${spaceId}`, {
      token,
      method: "DELETE",
    })
      .then(() => fetchSpaces())
      .catch((e) => setErr(e.message));
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin: Spaces</h2>
          <p className="mt-1 text-sm text-gray-600">Manage spaces.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Space"}
        </button>
      </div>

      {err && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error: {err}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Space</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="number"
              placeholder="Price per hour"
              value={formData.price_per_hour}
              onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="number"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="url"
              placeholder="Image URL"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2"
            rows="3"
            required
          />
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              id="is_active"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Add Space
          </button>
        </form>
      )}

      {status === "loading" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm">
          Loading spaces…
        </div>
      )}

      {status === "failed" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error: {err}
        </div>
      )}

      {status === "succeeded" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <div className="col-span-2">ID</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Capacity</div>
            <div className="col-span-1">Active</div>
            <div className="col-span-1">Actions</div>
          </div>

          <ul className="divide-y">
            {spaces.map((s) => (
              <li key={s.id} className="grid grid-cols-12 gap-2 px-4 py-4 text-sm text-gray-800">
                <div className="col-span-2 font-medium">{s.id}</div>
                <div className="col-span-3">{s.name}</div>
                <div className="col-span-3 truncate">{s.description}</div>
                <div className="col-span-1">${s.price_per_hour}</div>
                <div className="col-span-1">{s.capacity}</div>
                <div className="col-span-1">
                  <button
                    onClick={() => toggleActive(s.id, s.is_active)}
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      s.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.is_active ? "Yes" : "No"}
                  </button>
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => deleteSpace(s.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

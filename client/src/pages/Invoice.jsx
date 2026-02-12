import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/client";

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        setLoading(true);

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await apiFetch(`/api/invoices/${id}`, { token });

        if (!alive) return;

        setInvoice(data.invoice);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load invoice");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, token, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-100" />
          <div className="h-4 w-60 rounded bg-gray-100" />
          <div className="h-4 w-48 rounded bg-gray-100" />
          <div className="h-4 w-72 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Invoice #{invoice.id}
        </h1>

        <div className="mt-6 space-y-3 text-sm text-gray-800">
          <p>
            <span className="font-semibold">Space:</span>{" "}
            {invoice.space_name || "-"}
          </p>

          <p>
            <span className="font-semibold">Amount:</span>{" "}
            KES {Number(invoice.amount || 0).toLocaleString("en-KE")}{" "}
            {String(invoice.currency || "").toUpperCase()}
          </p>

          <p>
            <span className="font-semibold">Status:</span>{" "}
            {invoice.status}
          </p>

          <p>
            <span className="font-semibold">Issued At:</span>{" "}
            {invoice.issued_at
              ? new Date(invoice.issued_at).toLocaleString()
              : "-"}
          </p>

          {invoice.due_at && (
            <p>
              <span className="font-semibold">Due At:</span>{" "}
              {new Date(invoice.due_at).toLocaleString()}
            </p>
          )}

          <hr className="my-4" />

          <p>
            <span className="font-semibold">Booking Start:</span>{" "}
            {invoice.start_time
              ? new Date(invoice.start_time).toLocaleString()
              : "-"}
          </p>

          <p>
            <span className="font-semibold">Booking End:</span>{" "}
            {invoice.end_time
              ? new Date(invoice.end_time).toLocaleString()
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";

const tokenKey = "spacer_token";

const Invoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);

    apiFetch(`/api/invoices/${id}`, { token })
      .then((data) => setInvoice(data))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!invoice) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Invoice #{invoice.id}</h1>
      <p><strong>Space:</strong> {invoice.space_name}</p>
      <p><strong>Amount:</strong> {invoice.amount} {String(invoice.currency || "").toUpperCase()}</p>
      <p><strong>Issued At:</strong> {new Date(invoice.issued_at).toLocaleString()}</p>
      {invoice.due_at && <p><strong>Due At:</strong> {new Date(invoice.due_at).toLocaleString()}</p>}
      <p><strong>Booking Start:</strong> {new Date(invoice.start_time).toLocaleString()}</p>
      <p><strong>Booking End:</strong> {new Date(invoice.end_time).toLocaleString()}</p>
    </div>
  );
};

export default Invoice;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Invoice = () => {
  const { id } = useParams(); // invoice id from URL
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch invoice details from backend
    fetch(`http://127.0.0.1:5001/invoices/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvoice(data);
        }
      })
      .catch(err => setError(err.message));
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!invoice) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Invoice #{invoice.id}</h1>
      <p><strong>Space:</strong> {invoice.space_name}</p>
      <p><strong>Amount:</strong> ${invoice.amount} {invoice.currency.toUpperCase()}</p>
      <p><strong>Issued At:</strong> {new Date(invoice.issued_at).toLocaleString()}</p>
      {invoice.due_at && <p><strong>Due At:</strong> {new Date(invoice.due_at).toLocaleString()}</p>}
      <p><strong>Booking Start:</strong> {new Date(invoice.start_time).toLocaleString()}</p>
      <p><strong>Booking End:</strong> {new Date(invoice.end_time).toLocaleString()}</p>
    </div>
  );
};

export default Invoice;

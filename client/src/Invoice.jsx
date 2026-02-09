import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * Invoice component displays details of a specific invoice.
 * Fetches invoice data from the backend using the ID from URL params.
 */
const Invoice = () => {
  const { id } = useParams(); // Get invoice ID from URL parameters
  const [invoice, setInvoice] = useState(null); // State for invoice data
  const [error, setError] = useState(null); // State for error messages

  // Fetch invoice details when component mounts or ID changes
  useEffect(() => {
    fetch(`http://127.0.0.1:5001/invoices/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Include JWT token
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error); // Set error if API returns error
        } else {
          setInvoice(data); // Set invoice data if successful
        }
      })
      .catch(err => setError(err.message)); // Handle fetch errors
  }, [id]);

  // Display error if any
  if (error) return <div>Error: {error}</div>;
  // Display loading if data not yet fetched
  if (!invoice) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Invoice #{invoice.id}</h1>
      <p><strong>Space:</strong> {invoice.space_name}</p>
      <p><strong>Amount:</strong> ${invoice.amount} {invoice.currency.toUpperCase()}</p>
      <p><strong>Issued At:</strong> {new Date(invoice.issued_at).toLocaleString()}</p>
      {/* Display due date if available */}
      {invoice.due_at && <p><strong>Due At:</strong> {new Date(invoice.due_at).toLocaleString()}</p>}
      <p><strong>Booking Start:</strong> {new Date(invoice.start_time).toLocaleString()}</p>
      <p><strong>Booking End:</strong> {new Date(invoice.end_time).toLocaleString()}</p>
    </div>
  );
};

export default Invoice;

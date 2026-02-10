import { useState } from 'react';

const AgreementModal = ({ bookingId, onAccept, onClose }) => {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = () => {
    if (!accepted) return;

    // Accept agreement
    fetch('http://127.0.0.1:5001/agreements/accept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ booking_id: bookingId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          onAccept(data);
          onClose();
        }
      })
      .catch(err => setError(err.message));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
        <h2>Agreement Acceptance</h2>
        <p>By booking this space, you agree to the terms and conditions.</p>
        <label>
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
          I accept the agreement
        </label>
        <br />
        <button onClick={handleAccept} disabled={!accepted}>Accept</button>
        <button onClick={onClose}>Cancel</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
    </div>
  );
};

export default AgreementModal;


import { useState } from "react";
import { apiFetch } from "../../api/client";

const AgreementModal = ({ bookingId, onAccept, onClose }) => {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    if (!accepted) return;

    try {
      const token = localStorage.getItem("spacer_token"); 
      const data = await apiFetch("/api/agreements/accept", {
        method: "POST",
        token,
        body: { booking_id: bookingId },
      });

      onAccept?.(data);
      onClose?.();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px" }}>
        <h2>Agreement Acceptance</h2>
        <p>By booking this space, you agree to the terms and conditions.</p>

        <label>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I accept the agreement
        </label>

        <br />

        <button onClick={handleAccept} disabled={!accepted}>Accept</button>
        <button onClick={onClose}>Cancel</button>

        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
    </div>
  );
};

export default AgreementModal;

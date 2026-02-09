import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Checkout from "./Checkout";
import Invoice from "./Invoice";

/**
 * Main App component with routing for the Spacer application.
 * Handles backend health check and renders different pages based on routes.
 */
function App() {
  const [health, setHealth] = useState(null); // State to store backend health response
  const [error, setError] = useState(null); // State to store any error messages

  // Check backend health on component mount
  useEffect(() => {
    fetch("http://127.0.0.1:5001/health")
      .then((res) => {
        if (!res.ok) throw new Error("API not reachable");
        return res.json();
      })
      .then(setHealth) // Set health data if successful
      .catch((err) => setError(err.message)); // Set error message if failed
  }, []);

  return (
    <Router>
      <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>Spacer</h1>
        <p>Book unique spaces for your events</p>

        {/* Display error if backend is not reachable */}
        {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

        {/* Render routes only if backend is healthy */}
        {health ? (
          <Routes>
            <Route path="/" element={
              <div>
                <p>Welcome to Spacer! Platform to book spaces.</p>
                {/* Display backend health data */}
                <pre>{JSON.stringify(health, null, 2)}</pre>
              </div>
            } />
            {/* Route for payment checkout */}
            <Route path="/checkout/:bookingId/:amount" element={<Checkout />} />
            {/* Route for viewing invoices */}
            <Route path="/invoice/:id" element={<Invoice />} />
          </Routes>
        ) : (
          <p>Checking backend connection…</p>
        )}
      </div>
    </Router>
  );
}

export default App;

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Checkout from "./Checkout";
import Invoice from "./Invoice";

// Main App component with routing
function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  // Check backend health on component mount
  useEffect(() => {
    fetch("http://127.0.0.1:5001/health")
      .then((res) => {
        if (!res.ok) throw new Error("API not reachable");
        return res.json();
      })
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Router>
      <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>Spacer</h1>
        <p>Book unique spaces for your events</p>

        {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

        {health ? (
          <Routes>
            <Route path="/" element={
              <div>
                <p>Welcome to Spacer! Platform to book spaces.</p>
                <pre>{JSON.stringify(health, null, 2)}</pre>
              </div>
            } />
            <Route path="/checkout/:bookingId/:amount" element={<Checkout />} />
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

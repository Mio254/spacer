import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

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
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Spacer</h1>
      <p>Vite + React frontend skeleton</p>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {health ? (
        <pre>{JSON.stringify(health, null, 2)}</pre>
      ) : (
        <p>Checking backend connection…</p>
      )}
    </div>
  );
}

export default App;

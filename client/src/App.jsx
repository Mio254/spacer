import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "./features/auth/authSlice";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";

import SpacesPage from "./pages/SpacesPage";
import SpaceDetailPage from "./pages/SpaceDetailPage";

function Home() {
  const { user, token } = useSelector((s) => s.auth);

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

      <hr />

      <p><strong>Auth:</strong></p>
      {token ? (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>Not logged in.</p>
      )}
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);

  return (
    <BrowserRouter>
      <nav
        style={{
          display: "flex",
          gap: 12,
          padding: 12,
          borderBottom: "1px solid #ddd",
          alignItems: "center",
        }}
      >
        <Link to="/">Home</Link>
        <Link to="/spaces">Spaces</Link>

        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Register</Link>}

        {user?.role === "admin" && <Link to="/admin/users">Admin Users</Link>}

        {token && (
          <button
            type="button"
            onClick={() => dispatch(clearAuth())}
            style={{ marginLeft: "auto" }}
          >
            Logout
          </button>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

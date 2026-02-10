import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SpacesPage from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';
import AdminSpacesPage from './pages/AdminSpacesPage';

function App() {
  return (
    <BrowserRouter>
      {/* ---------------- Navigation Bar ---------------- */}
     <nav style={{
  background: '#1a1a1a',
  padding: '1rem 2rem',
  display: 'flex',
  justifyContent: 'space-between', // This pushes items to ends
  alignItems: 'center',
  marginBottom: '2rem'
}}>
  
  {/* Left side: Home & Browse Spaces */}
  <div style={{ display: 'flex', gap: '3rem' }}> {/* Increased from 2rem to 3rem */}
  <Link to="/">🏠 Home</Link>
  <Link to="/spaces">🔍 Browse Spaces</Link>
</div>
  
  {/* Right side: Admin Dashboard (far end) */}
  <Link to="/admin/spaces" style={{ 
    color: 'white', 
    textDecoration: 'none',
    background: '#007bff',
    padding: '0.5rem 1.5rem',
    borderRadius: '6px',
    fontWeight: 'bold'
  }}>
    ⚙️ Admin Dashboard
  </Link>
  
</nav>

      {/* ---------------- Page Routes ---------------- */}
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<SpacesPage />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailPage />} />

        {/* Admin page (protected logic to be added later) */}
        <Route path="/admin/spaces" element={<AdminSpacesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// ---------------- Styles ----------------
const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
};

const adminLinkStyle = {
  background: '#007bff',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
};

export default App;

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SpacesPage from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';
import AdminSpacesPage from './pages/AdminSpacesPage';

function App() {
  return (
    <BrowserRouter>
      <nav style={{
        background: '#1a1a1a',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '3rem' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>🏠 Home</Link>
          <Link to="/spaces" style={{ color: 'white', textDecoration: 'none' }}>🔍 Browse Spaces</Link>
        </div>
        
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

      <Routes>
        <Route path="/" element={<SpacesPage />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailPage />} />
        <Route path="/admin/spaces" element={<AdminSpacesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

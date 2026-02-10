import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SpacesPage from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Make homepage show spaces */}
        <Route path="/" element={<SpacesPage />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// Add to your Routes in App.jsx:
<Route path="/admin/spaces" element={<AdminSpacesPage />} />

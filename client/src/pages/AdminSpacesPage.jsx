import { useEffect, useState } from 'react';
import './AdminSpacesPage.css';

function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/spaces');
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      // Show only active spaces
      const activeSpaces = data.filter(space => space.is_active);
      setSpaces(activeSpaces);
    } catch (err) {
      console.error('Error loading spaces:', err);
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSpaces(); }, []);

  const addSpace = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !price) {
      setError('Name and price are required');
      return;
    }

    try {
      const res = await fetch('/api/admin/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price_per_hour: parseFloat(price),
          capacity: 20,
          description: "New space",
          image_url: "",
          is_active: true
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = data.errors 
          ? 'Validation: ' + data.errors.join(', ')
          : data.error || `HTTP ${res.status}: Failed to add space`;
        throw new Error(errorMsg);
      }

      await loadSpaces();
      setName('');
      setPrice('');
    } catch (err) {
      console.error('Error adding space:', err);
      setError('Error: ' + err.message);
    }
  };

  const deleteSpace = async (id) => {
    const confirmDelete = window.confirm('Delete this space?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/spaces/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      // Remove from local state
      setSpaces(prev => prev.filter(space => space.id !== id));
    } catch (err) {
      console.error('Error deleting space:', err);
      setError('Failed to delete space.');
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="add-form">
        <h2>Add New Space</h2>
        <form onSubmit={addSpace}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Space name"
            required
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price (KSH)"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Space'}
          </button>
        </form>
      </div>

      <div className="spaces-container">
        <h2>Active Spaces ({spaces.length})</h2>
        
        {loading ? (
          <p>Loading...</p>
        ) : spaces.length === 0 ? (
          <p>No spaces yet</p>
        ) : (
          <div className="grid-3x4">
            {spaces.slice(0, 12).map((space) => (
              <div key={space.id} className="space-card">
                <h3>{space.name}</h3>
                <div className="price">KSH {space.price_per_hour}/hour</div>
                <div className="capacity">{space.capacity} people</div>
                <div className="location">{space.location || 'No location'}</div>
                <button 
                  onClick={() => deleteSpace(space.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSpacesPage;

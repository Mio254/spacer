import { useEffect, useState } from 'react';
import './AdminSpacesPage.css';

const API_URL = 'http://localhost:5001/api';

function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/admin/spaces`);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      setSpaces(data);
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

    if (!name || !price || !capacity || !location) {
      setError('Name, price, capacity, and location are required');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        price_per_hour: parseFloat(price),
        capacity: parseInt(capacity),
        location: location.trim(),
        image_url: imageUrl.trim() || '',
        description: "New space",
        is_active: true
      };

      console.log('Sending:', payload);

      const res = await fetch(`${API_URL}/admin/spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Response:', data);
      
      if (!res.ok) {
        const errorMsg = data.errors 
          ? 'Validation: ' + data.errors.join(', ')
          : data.error || `HTTP ${res.status}: Failed to add space`;
        throw new Error(errorMsg);
      }

      alert('Space added successfully!');
      await loadSpaces();
      setName('');
      setPrice('');
      setCapacity('');
      setLocation('');
      setImageUrl('');
    } catch (err) {
      console.error('Error adding space:', err);
      setError('Error: ' + err.message);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_URL}/admin/spaces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (!res.ok) throw new Error('Toggle failed');
      await loadSpaces();
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setError('Failed to toggle visibility.');
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
            placeholder="Price per hour (KSH)"
            required
          />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Capacity (number of people)"
            required
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g., Westlands, Nairobi)"
            required
          />
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Space'}
          </button>
        </form>
      </div>

      <div className="spaces-container">
        <h2>All Spaces ({spaces.length})</h2>
        
        {loading ? (
          <p>Loading...</p>
        ) : spaces.length === 0 ? (
          <p>No spaces yet</p>
        ) : (
          <div className="grid-3x4">
            {spaces.slice(0, 12).map((space) => (
              <div key={space.id} className="space-card" style={{ opacity: space.is_active ? 1 : 0.6 }}>
                <img 
                  src={space.image_url || 'https://via.placeholder.com/300x200'} 
                  alt={space.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }}
                />
                <h3>{space.name}</h3>
                <div className="price">KSH {space.price_per_hour}/hour</div>
                <div className="capacity">{space.capacity} people</div>
                <div className="location">{space.location || 'No location'}</div>
                <div style={{ fontSize: '0.85rem', color: space.is_active ? 'green' : 'red', marginTop: '5px' }}>
                  {space.is_active ? '✓ Visible to public' : '✗ Hidden from public'}
                </div>
                <button 
                  onClick={() => toggleVisibility(space.id, space.is_active)}
                  className="delete-btn"
                  style={{ background: space.is_active ? '#dc3545' : '#28a745' }}
                >
                  {space.is_active ? 'Hide' : 'Show'}
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

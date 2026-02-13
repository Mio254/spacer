import { useEffect, useState } from 'react';
import './AdminSpacesPage.css';

const API_URL = 'http://localhost:5001/api';

function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [editingSpace, setEditingSpace] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      setFilteredSpaces(data);
    } catch (err) {
      console.error('Error loading spaces:', err);
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSpaces(); }, []);

  // Filter spaces based on search and status
  useEffect(() => {
    let filtered = spaces;
    
    if (searchTerm) {
      filtered = filtered.filter(space => 
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(space => 
        filterStatus === 'active' ? space.is_active : !space.is_active
      );
    }
    
    setFilteredSpaces(filtered);
  }, [searchTerm, filterStatus, spaces]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCapacity('');
    setLocation('');
    setImageUrl('');
    setEditingSpace(null);
  };

  const handleEdit = (space) => {
    setEditingSpace(space);
    setName(space.name);
    setDescription(space.description || '');
    setPrice(space.price_per_hour);
    setCapacity(space.capacity);
    setLocation(space.location || '');
    setImageUrl(space.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !price || !capacity || !location) {
      setError('Name, price, capacity, and location are required');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || 'New space',
        price_per_hour: parseFloat(price),
        capacity: parseInt(capacity),
        location: location.trim(),
        image_url: imageUrl.trim() || '',
        is_active: true
      };

      const url = editingSpace 
        ? `${API_URL}/admin/spaces/${editingSpace.id}`
        : `${API_URL}/admin/spaces`;
      
      const method = editingSpace ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = data.errors 
          ? 'Validation: ' + data.errors.join(', ')
          : data.error || `HTTP ${res.status}: Failed`;
        throw new Error(errorMsg);
      }

      alert(editingSpace ? 'Space updated successfully!' : 'Space added successfully!');
      await loadSpaces();
      resetForm();
    } catch (err) {
      console.error('Error:', err);
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

  const activeCount = spaces.filter(s => s.is_active).length;
  const inactiveCount = spaces.length - activeCount;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{spaces.length}</div>
          <div className="stat-label">Total Spaces</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-value">{inactiveCount}</div>
          <div className="stat-label">Inactive</div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Add/Edit Form */}
      <div className="add-form">
        <h2>{editingSpace ? 'Edit Space' : 'Add New Space'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Space name *"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows="3"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price per hour (KSH) *"
            required
          />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Capacity (number of people) *"
            required
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g., Westlands, Nairobi) *"
            required
          />
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingSpace ? 'Update Space' : 'Add Space'}
            </button>
            {editingSpace && (
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search and Filter */}
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">All Spaces</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Spaces Grid */}
      <div className="spaces-container">
        <h2>All Spaces ({filteredSpaces.length})</h2>
        
        {loading ? (
          <p>Loading...</p>
        ) : filteredSpaces.length === 0 ? (
          <p>No spaces found</p>
        ) : (
          <div className="grid-3x4">
            {filteredSpaces.map((space) => (
              <div key={space.id} className="space-card" style={{ opacity: space.is_active ? 1 : 0.6 }}>
                <img 
                  src={space.image_url || 'https://via.placeholder.com/300x200'} 
                  alt={space.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }}
                />
                <h3>{space.name}</h3>
                <p className="description">{space.description}</p>
                <div className="price">KSH {space.price_per_hour}/hour</div>
                <div className="capacity">👥 {space.capacity} people</div>
                <div className="location">📍 {space.location || 'No location'}</div>
                <div style={{ fontSize: '0.85rem', color: space.is_active ? 'green' : 'red', marginTop: '5px', fontWeight: 'bold' }}>
                  {space.is_active ? '✓ Active' : '✗ Inactive'}
                </div>
                <div className="card-actions">
                  <button onClick={() => handleEdit(space)} className="edit-btn">
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => toggleVisibility(space.id, space.is_active)}
                    className="toggle-btn"
                    style={{ background: space.is_active ? '#dc3545' : '#28a745' }}
                  >
                    {space.is_active ? 'Hide' : 'Restore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSpacesPage;

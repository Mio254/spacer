import { useEffect, useState } from 'react';
import './AdminSpacesPage.css';

function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/spaces');
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      setSpaces(data);
    } catch (err) {
      console.error('Error loading spaces:', err);
      setError('Error loading: ' + err.message);
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
          capacity: capacity,
          description: "New space added via admin dashboard",
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
      setCapacity(20);
    } catch (err) {
      console.error('Error adding space:', err);
      setError('Error: ' + err.message);
    }
  };

  const deleteSpace = async (id) => {
    const confirmDelete = window.confirm('Mark this space as inactive? It can be restored later.');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/spaces/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      setSpaces(prev => prev.map(space => 
        space.id === id ? { ...space, is_active: false } : space
      ));
    } catch (err) {
      console.error('Error deleting space:', err);
      setError('Failed to delete space.');
    }
  };

  const restoreSpace = async (id) => {
    try {
      const res = await fetch(`/api/admin/spaces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      });
      
      if (!res.ok) throw new Error('Restore failed');
      
      setSpaces(prev => prev.map(space => 
        space.id === id ? { ...space, is_active: true } : space
      ));
    } catch (err) {
      console.error('Error restoring space:', err);
      setError('Failed to restore space.');
    }
  };

  // Calculate stats
  const activeSpaces = spaces.filter(s => s.is_active).length;
  const inactiveSpaces = spaces.filter(s => !s.is_active).length;
  const totalRevenue = spaces.reduce((sum, space) => sum + space.price_per_hour, 0);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin: Manage Spaces</h1>
        <div className="spaces-count">
          {spaces.length} Total Spaces
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={addSpace} className="add-space-form">
        <h3>Add New Space</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Space Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Conference Room A"
              className="form-control"
              required
              minLength="2"
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price per hour (KSH) *</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 2500"
              className="form-control"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Number of people"
              className="form-control"
              min="1"
            />
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Adding...
                </>
              ) : (
                'Add New Space'
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="spaces-list">
        <div className="spaces-header">
          <h3>All Spaces</h3>
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Active:</span>
              <span className="stat-value">{activeSpaces}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Inactive:</span>
              <span className="stat-value">{inactiveSpaces}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value">KSH {totalRevenue.toLocaleString()}/hr</span>
            </div>
          </div>
        </div>
        
        {loading && <div className="loading-text">Loading spaces...</div>}
        
        {!loading && spaces.length === 0 && (
          <div className="no-spaces">
            <p>No spaces have been added yet.</p>
            <p>Use the form above to add your first space.</p>
          </div>
        )}

        {!loading && spaces.length > 0 && (
          <div className="spaces-grid">
            {spaces.map((space) => (
              <div 
                key={space.id} 
                className={`space-card ${space.is_active ? '' : 'inactive'}`}
              >
                <div className="space-header">
                  <h4 className="space-title">{space.name}</h4>
                  <span className={`status-badge ${space.is_active ? 'active' : 'inactive'}`}>
                    {space.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                
                <div className="space-details">
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">
                      <span className="currency">KSH {space.price_per_hour}</span>/hour
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">{space.capacity} people</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{space.location || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">#{space.id}</span>
                  </div>
                </div>
                
                <div className="space-actions">
                  {space.is_active ? (
                    <button 
                      onClick={() => deleteSpace(space.id)}
                      className="action-btn btn-delete"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  ) : (
                    <button 
                      onClick={() => restoreSpace(space.id)}
                      className="action-btn btn-restore"
                    >
                      <span>↻</span> Restore
                    </button>
                  )}
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

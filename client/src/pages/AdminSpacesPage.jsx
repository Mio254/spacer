import { useEffect, useState } from 'react';

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
    const confirmDelete = window.confirm('Delete this space? (Mark as inactive)');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/spaces/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      // Update local state
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
      
      // Update local state
      setSpaces(prev => prev.map(space => 
        space.id === id ? { ...space, is_active: true } : space
      ));
    } catch (err) {
      console.error('Error restoring space:', err);
      setError('Failed to restore space.');
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin: Manage Spaces</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={addSpace} className="add-space-form">
        <h3>Add New Space</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Space name"
          required
          minLength="2"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price per hour (KSH)"
          required
          min="0"
          step="0.01"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Space'}
        </button>
      </form>

      <div className="spaces-list">
        <h3>All Spaces ({spaces.length})</h3>
        
        {loading && <p>Loading spaces...</p>}
        
        {!loading && spaces.length === 0 && (
          <p className="no-spaces">No spaces added yet.</p>
        )}

        <div className="spaces-grid">
          {spaces.map((space) => (
            <div 
              key={space.id} 
              className={`space-card ${space.is_active ? 'active' : 'inactive'}`}
            >
              <div className="space-header">
                <h4>{space.name}</h4>
                <span className={`status-badge ${space.is_active ? 'active' : 'inactive'}`}>
                  {space.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              
              <div className="space-details">
                <div className="detail">
                  <strong>Price:</strong> KSH {space.price_per_hour}/hour
                </div>
                <div className="detail">
                  <strong>Capacity:</strong> {space.capacity} people
                </div>
                <div className="detail">
                  <strong>Location:</strong> {space.location || 'Not specified'}
                </div>
              </div>
              
              <div className="space-actions">
                {space.is_active ? (
                  <button 
                    onClick={() => deleteSpace(space.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                ) : (
                  <button 
                    onClick={() => restoreSpace(space.id)}
                    className="btn-restore"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          border-left: 4px solid #c62828;
        }
        
        .add-space-form {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .add-space-form h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
        }
        
        .add-space-form input {
          width: 100%;
          padding: 12px 15px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          box-sizing: border-box;
        }
        
        .add-space-form input:focus {
          outline: none;
          border-color: #4a6cf7;
        }
        
        .add-space-form button {
          background-color: #4a6cf7;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .add-space-form button:hover {
          background-color: #3a5ce5;
        }
        
        .add-space-form button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .spaces-list h3 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .no-spaces {
          text-align: center;
          padding: 40px;
          color: #666;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .spaces-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .space-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .space-card:hover {
          transform: translateY(-2px);
        }
        
        .space-card.inactive {
          opacity: 0.7;
          background-color: #f8f9fa;
        }
        
        .space-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        
        .space-header h4 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status-badge.active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.inactive {
          background-color: #ffebee;
          color: #c62828;
        }
        
        .space-details {
          margin-bottom: 20px;
        }
        
        .detail {
          margin-bottom: 8px;
          color: #555;
        }
        
        .detail strong {
          color: #333;
          margin-right: 5px;
        }
        
        .space-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .btn-delete {
          background-color: #ff4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-delete:hover {
          background-color: #cc0000;
        }
        
        .btn-restore {
          background-color: #00c851;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-restore:hover {
          background-color: #007e33;
        }
      `}</style>
    </div>
  );
}

export default AdminSpacesPage;

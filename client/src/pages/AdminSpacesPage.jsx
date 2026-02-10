import { useEffect, useState } from 'react';

function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load ALL spaces (including inactive for admin)
  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/spaces');  // FIXED: admin endpoint
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Backend returned HTML (${res.status})`);
      }

      const data = await res.json();
      setSpaces(data);
    } catch (err) {
      console.error('Error loading spaces:', err);
      setError('Backend error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSpaces(); }, []);

  // Add space with proper validation error handling
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
          capacity: 20,                    // ADDED: required field
          description: "New space",        // ADDED: required field  
          image_url: "",                   // ADDED: required field
          is_active: true                  // ADDED: required field
        }),
      });

      // Read response even for 400 errors
      const data = await res.json();
      
      if (!res.ok) {
        // Show actual backend validation errors
        const errorMsg = data.errors 
          ? 'Validation errors: ' + data.errors.join(', ')
          : data.error || `HTTP ${res.status}: Failed to add space`;
        throw new Error(errorMsg);
      }

      // Success
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
      setSpaces((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting space:', err);
      setError('Failed to delete space.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1>Admin: Manage Spaces</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={addSpace} style={{ marginBottom: '2rem' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Space name (min 2 characters)"
          style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price per hour (KSH)"
          style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
        />
        <button disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Saving...' : 'Add Space'}
        </button>
      </form>

      <hr />
      {loading && <p>Loading spaces...</p>}
      {!loading && spaces.length === 0 && <p>No spaces added yet.</p>}

      {spaces.map((space) => (
        <div key={space.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #ccc', borderRadius: 4 }}>
          <strong>{space.name}</strong>
          <div>KSH {space.price_per_hour}</div>
          <div>Capacity: {space.capacity}</div>
          <div>Status: {space.is_active ? 'Active' : 'Inactive'}</div>
          <button onClick={() => deleteSpace(space.id)} style={{ marginTop: 6, padding: '0.25rem 0.5rem' }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminSpacesPage;

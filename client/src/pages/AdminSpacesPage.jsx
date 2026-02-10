import { useEffect, useState } from 'react';

function AdminSpacesPage() {
  // ---------------- State ----------------
  const [spaces, setSpaces] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------------- Load Spaces ----------------
  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/spaces');

      console.log('Response status:', res.status);
      console.log('Response type:', res.headers.get('content-type'));

      // Ensure backend returned JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Got HTML instead of JSON:', text.substring(0, 200));
        throw new Error(
          `Backend returned HTML (${res.status}). Check if Flask is running.`
        );
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

  // ---------------- Fetch spaces on page load ----------------
  useEffect(() => {
    loadSpaces();
  }, []);

  // ---------------- Add Space ----------------
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
          name,
          price_per_hour: Number(price),
        }),
      });

      if (!res.ok) throw new Error('Failed to add space');

      await loadSpaces();
      setName('');
      setPrice('');
    } catch (err) {
      console.error('Error adding space:', err);
      setError('Could not add space.');
    }
  };

  // ---------------- Delete Space ----------------
  const deleteSpace = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this space?'
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/spaces/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      // Optimistic update
      setSpaces((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting space:', err);
      setError('Failed to delete space.');
    }
  };

  // ---------------- Render ----------------
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1>Admin: Manage Spaces</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={addSpace} style={{ marginBottom: '2rem' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Space name"
          style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          type="number"
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
        <div
          key={space.id}
          style={{
            marginBottom: 12,
            padding: 12,
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
        >
          <strong>{space.name}</strong>
          <div>KSH {space.price_per_hour}</div>
          <button
            onClick={() => deleteSpace(space.id)}
            style={{ marginTop: 6, padding: '0.25rem 0.5rem' }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminSpacesPage;

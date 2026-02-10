import { useEffect, useState } from 'react';

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch spaces once on page load
  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/spaces');

      if (!res.ok) throw new Error('Failed to fetch spaces');

      const data = await res.json();
      setSpaces(data);
    } catch (err) {
      console.error(err);
      setError('Could not load spaces. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

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

      // Reload instead of assuming backend response shape
      await loadSpaces();
      setName('');
      setPrice('');
    } catch (err) {
      console.error(err);
      setError('Could not add space.');
    }
  };

  const deleteSpace = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this space?'
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/spaces/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');

      // Optimistic-ish update
      setSpaces(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete space.');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Admin: Manage Spaces</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={addSpace}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Space name"
        />

        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Price per hour (KSH)"
        />

        <button disabled={loading}>
          {loading ? 'Saving...' : 'Add Space'}
        </button>
      </form>

      <hr />

      {loading && <p>Loading spaces...</p>}

      {!loading && spaces.length === 0 && (
        <p>No spaces added yet.</p>
      )}

      {spaces.map(space => (
        <div key={space.id} style={{ marginBottom: 12 }}>
          <strong>{space.name}</strong>
          <div>KSH {space.price_per_hour}</div>

          <button onClick={() => deleteSpace(space.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

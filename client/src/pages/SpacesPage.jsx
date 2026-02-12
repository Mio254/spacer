import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5001/api';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/spaces`)
      .then(res => res.json())
      .then(data => {
        setSpaces(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Spaces</h1>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px'}}>
        {spaces.map(space => (
          <div 
            key={space.id} 
            style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}
          >
            <img 
              src={space.image_url || 'https://via.placeholder.com/300x200'} 
              alt={space.name} 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px' }} 
            />
            <h3>{space.name}</h3>
            <p style={{color: '#666', fontSize: '0.9rem'}}>📍 {space.location || 'Nairobi, Kenya'}</p>
            <p>KSH {space.price_per_hour.toLocaleString()}/hour • 👥 {space.max_capacity || space.capacity} people</p>
            <Link to={`/spaces/${space.id}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

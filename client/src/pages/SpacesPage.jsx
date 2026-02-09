import { useState, useEffect } from 'react';
import { spaceService } from '../services/spaceService';
import { Link } from 'react-router-dom';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    spaceService.getAllSpaces()
      .then(setSpaces)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Spaces</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {spaces.map(space => (
          <div 
            key={space.id} 
            style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', overflow: 'hidden' }}
          >
            <img 
              src={space.image_url || 'https://via.placeholder.com/300x200'} 
              alt={space.name} 
              width="100%" 
              style={{ height: '200px', objectFit: 'cover', borderRadius: '6px' }} 
            />
            <h3>{space.name}</h3>
            <p style={{color: '#666', fontSize: '0.9rem'}}>📍 {space.location || 'Nairobi, Kenya'}</p>
            <p>KSH {space.price_per_hour}/hour • 👥 {space.max_capacity || space.capacity} people</p>
            <Link to={`/spaces/${space.id}`} style={{ color: '#007bff', textDecoration: 'underline' }}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  
  useEffect(() => {
    fetch('/api/spaces')
      .then(res => res.json())
      .then(setSpaces);
  }, []);
  
  const addSpace = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/spaces', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, price_per_hour: price})
    });
    setName(''); setPrice('');
  };
  
  const deleteSpace = async (id) => {
    await fetch(`/api/admin/spaces/${id}`, {method: 'DELETE'});
  };
  
  return (
    <div>
      <h1>Admin: Manage Spaces</h1>
      
      <form onSubmit={addSpace}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name"/>
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (KSH)"/>
        <button>Add Space</button>
      </form>
      
      <div>
        {spaces.map(s => (
          <div key={s.id}>
            <h3>{s.name}</h3>
            <p>KSH {s.price_per_hour}</p>
            <button onClick={() => deleteSpace(s.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
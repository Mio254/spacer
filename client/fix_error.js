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
        capacity: 10,
        description: 'New space',
        image_url: '',
        is_active: true,
      }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      // Show backend validation errors
      const errorMsg = data.errors ? data.errors.join(', ') : 'Failed to add space';
      throw new Error(errorMsg);
    }

    await loadSpaces();
    setName('');
    setPrice('');
  } catch (err) {
    console.error('Error adding space:', err);
    setError('Could not add space: ' + err.message);
  }
};

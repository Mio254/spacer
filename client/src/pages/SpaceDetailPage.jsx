import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { spaceService } from '../services/spaceService';
import './SpaceDetailPage.css';

export default function SpaceDetailPage() {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    spaceService.getSpace(id)
      .then(setSpace)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const calculateTotal = () => {
    if (!space || !startTime || !endTime) return 0;
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    const hours = Math.max(1, end - start);
    return space.price_per_hour * hours;
  };

  const handleBooking = () => {
    const totalPrice = calculateTotal();
    alert(`Booking requested for ${space.name}\nDate: ${selectedDate}\nTime: ${startTime} - ${endTime}\nTotal: KSH ${totalPrice}\nLocation: ${space.location}`);
  };

  if (loading) return <div className="loading">Loading space details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!space) return <div>Space not found</div>;

  return (
    <div className="space-detail-container">
      <div className="space-image-section">
        <img 
          src={space.image_url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800'} 
          alt={space.name} 
          className="space-main-image"
        />
        <div className="image-overlay">
          <span className="location-badge">📍 {space.location}</span>
        </div>
      </div>

      <div className="space-content">
        <h1 className="space-title">{space.name}</h1>

        <div className="space-highlights">
          <div className="highlight-card">
            <span className="highlight-icon">💰</span>
            <div>
              <div className="highlight-label">Hourly Rate</div>
              <div className="highlight-value">KSH {space.price_per_hour}/hr</div>
            </div>
          </div>

          <div className="highlight-card">
            <span className="highlight-icon">👥</span>
            <div>
              <div className="highlight-label">Maximum Capacity</div>
              <div className="highlight-value">{space.max_capacity || space.capacity} people</div>
            </div>
          </div>

          <div className="highlight-card">
            <span className="highlight-icon">🕒</span>
            <div>
              <div className="highlight-label">Operating Hours</div>
              <div className="highlight-value">{space.operating_hours || 'Flexible'}</div>
            </div>
          </div>
        </div>

        <div className="space-description">
          <h2>About This Space</h2>
          <p>{space.description}</p>
        </div>

        <div className="booking-section">
          <h2>Book This Space</h2>

          <div className="booking-form">
            <div className="form-group">
              <label>Select Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="time-selection">
              <div className="form-group">
                <label>Start Time</label>
                <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                  {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>End Time</label>
                <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                  {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="price-summary">
              <div className="price-row">
                <span>Hourly Rate:</span>
                <span>KSH {space.price_per_hour}</span>
              </div>
              <div className="price-row">
                <span>Duration:</span>
                <span>{parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0])} hours</span>
              </div>
              <div className="price-total">
                <span>Total Amount:</span>
                <span className="total-price">KSH {calculateTotal()}</span>
              </div>
            </div>

            <button 
              className="book-button"
              onClick={handleBooking}
              disabled={!selectedDate}
            >
              📅 Book Now for KSH {calculateTotal()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

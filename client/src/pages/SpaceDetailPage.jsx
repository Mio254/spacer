import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { spaceService } from '../services/spaceService';

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

  // Calculate total price based on duration
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
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>End Time</label>
                <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(time => (
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

      <style jsx>{`
        .space-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .space-image-section {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 30px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
        .space-main-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
        }
        .image-overlay {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
        }
        .space-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
        }
        .space-title {
          font-size: 2.5rem;
          margin-bottom: 30px;
          color: #1a1a1a;
        }
        .space-highlights {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .highlight-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.3s;
        }
        .highlight-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        .highlight-icon {
          font-size: 2rem;
        }
        .highlight-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 5px;
        }
        .highlight-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1a1a1a;
        }
        .space-description {
          margin-bottom: 40px;
        }
        .space-description h2 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #1a1a1a;
        }
        .space-description p {
          line-height: 1.6;
          color: #555;
        }
        .booking-section {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 30px;
          margin-top: 40px;
        }
        .booking-section h2 {
          font-size: 1.5rem;
          margin-bottom: 25px;
          color: #1a1a1a;
        }
        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .form-group {
          flex: 1;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #007bff;
        }
        .time-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .price-summary {
          background: white;
          border-radius: 10px;
          padding: 25px;
          margin: 20px 0;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .price-total {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          font-size: 1.2rem;
          font-weight: bold;
          border-top: 2px solid #007bff;
          margin-top: 10px;
        }
        .total-price {
          color: #007bff;
        }
        .book-button {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          padding: 18px 30px;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .book-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0,123,255,0.3);
        }
        .book-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .loading, .error {
          text-align: center;
          padding: 100px 20px;
          font-size: 1.2rem;
        }
        .error {
          color: #dc3545;
        }
        
        @media (max-width: 768px) {
          .space-highlights {
            grid-template-columns: 1fr;
          }
          .time-selection {
            grid-template-columns: 1fr;
          }
          .space-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
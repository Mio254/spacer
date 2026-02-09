# Spacer

A platform to book unique spaces for your events.

## Features

- User registration and authentication
- Space management (create, view spaces)
- Booking system
- Payment processing (mocked for testing)
- Invoice generation

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- SQLite (default database)

### Installation

1. **Backend Setup:**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python run.py
   ```
   Backend will run on http://127.0.0.1:5001

2. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Frontend will run on http://localhost:5174 (or next available port)

### Usage

- **API Endpoints:**
  - `POST /auth/register` - Register a new user
  - `POST /auth/login` - Login and get JWT token
  - `GET /spaces/` - List all spaces
  - `POST /spaces/` - Create a new space (authenticated)
  - `POST /bookings/` - Create a booking (authenticated)
  - `POST /payments/create-intent` - Create payment intent (authenticated)
  - `GET /invoices/{id}` - View invoice (authenticated)

- **Frontend Pages:**
  - `/` - Home page with backend health check
  - `/checkout/{bookingId}/{amount}` - Payment checkout
  - `/invoice/{id}` - View invoice

### Booking a Space

1. Register/Login via API
2. Create or view available spaces
3. Create a booking with space ID, start/end times
4. Proceed to checkout to complete payment
5. View invoice after payment

### Development

- Backend uses Flask with SQLAlchemy
- Frontend uses React with Vite
- Payments are mocked for development (replace with real Stripe keys in production)

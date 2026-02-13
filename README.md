# Spacer

Spacer is a Nairobi-based platform where people can discover and book unique venues for meetings, events, and creative sessions. It connects space owners with users looking for hourly/daily rentals, featuring real Nairobi locations with KSH pricing, capacity details, and booking functionality.

## Features

### Public Features
- **Browse Spaces** - View all available spaces with images, pricing, and location
- **Space Details** - Detailed view with capacity, operating hours, and booking form
- **Search & Filter** - Find spaces by name or location
- **Booking Simulation** - Calculate total cost based on date and time selection

### Admin Dashboard
- **View All Spaces** - List of all spaces (active + inactive)
- **Add New Space** - Form with name, description, price, capacity, location, image
- **Edit Space** - Update any space details
- **Soft Delete** - Hide spaces from public view (mark inactive)
- **Restore Space** - Reactivate inactive spaces
- **Status Indicators** - Visual active/inactive labels
- **Search & Filter** - Find spaces by name, location, or status
- **Analytics Cards** - Total spaces, active count, inactive count
- **3×4 Grid Layout** - Clean responsive design
- **Bulk Operations API** - Backend endpoint for bulk activate/deactivate/delete

## Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **Flask-Migrate** - Database migrations
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite** - Database

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server

## Setup Instructions
### Backend Setup

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

Backend runs on: **https://spacer-935q.onrender.com**

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on: **https://spacer-6fe2c.firebaseapp.com/**

### Database Setup

The database is automatically created when you run the backend. To seed with sample data:

```bash
cd server
source venv/bin/activate
python seed_spaces.py
```


## API Endpoints

### Public Endpoints
- `GET /api/spaces` - Get all active spaces
- `GET /api/spaces/:id` - Get single space details

### Admin Endpoints
- `GET /api/admin/spaces` - Get all spaces (active + inactive)
- `POST /api/admin/spaces` - Create new space
- `PUT /api/admin/spaces/:id` - Update space
- `DELETE /api/admin/spaces/:id` - Soft delete space (mark inactive)
- `POST /api/admin/spaces/bulk` - Bulk operations (activate/deactivate/delete)

## Database Schema

### Space Model
- `id` - Primary key
- `name` - Space name
- `description` - Space description
- `price_per_hour` - Hourly rate in KSH
- `capacity` - Number of people
- `location` - Location in Nairobi
- `image_url` - Space image URL
- `is_active` - Active/inactive status
- `max_capacity` - Maximum capacity
- `operating_hours` - Operating hours
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Sample Spaces

The seed file includes 12 sample spaces:
1. Westlands Tech Hub - KSH 2,500/hr
2. Kilimani Sky Garden - KSH 5,000/hr
3. Karen Art Sanctuary - KSH 1,800/hr
4. Upper Hill Executive Suite - KSH 3,500/hr
5. Lavington Green Gardens - KSH 4,200/hr
6. Conference Room (Meridian Hotel) - KSH 8,500/hr
7. Art Studio (Rosslyn Lone Tree Estate) - KSH 4,500/hr
8. Meeting Pod (Layali House) - KSH 3,000/hr
9. Parklands Photography Studio - KSH 2,800/hr
10. Event Terrace (Tribe Hotel) - KSH 4,500/hr
11. Nairobi Tech Lab (Kasarani) - KSH 3,200/hr
12. Physics Research Room (Egerton University) - KSH 2,200/hr

## Development

### Running in Development Mode

Both servers support hot reload:
- Backend: Flask debug mode enabled
- Frontend: Vite HMR (Hot Module Replacement)

### Making Changes

1. Backend changes: Edit files in `server/app/`
2. Frontend changes: Edit files in `client/src/`
3. Database changes: Create migration with Flask-Migrate

## Contributing

This is a demo project for space booking management.
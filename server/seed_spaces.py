# Seed data for Nairobi spaces - Role 2
# All prices in Kenyan Shillings (KSH)
sample_spaces = [
    {
        "name": "Westlands Tech Hub",
        "description": "Modern co-working space with high-speed internet, meeting rooms, and coffee bar. Perfect for tech startups and remote teams.",
        "price_per_hour": 2500,
        "capacity": 50,
        "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800",
        "location": "Westlands, Nairobi",
        "max_capacity": 50,
        "operating_hours": "7:00 AM - 10:00 PM Daily",
        "is_active": True
    },
    {
        "name": "Kilimani Sky Garden",
        "description": "Elegant rooftop venue with panoramic city views. Ideal for weddings, corporate events, and sunset cocktails.",
        "price_per_hour": 5000,
        "capacity": 120,
        "image_url": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800",
        "location": "Kilimani, Nairobi",
        "max_capacity": 120,
        "operating_hours": "8:00 AM - 11:00 PM",
        "is_active": True
    },
    {
        "name": "Karen Art Sanctuary",
        "description": "Spacious art studio with natural lighting, pottery wheels, and painting supplies. Perfect for workshops and creative sessions.",
        "price_per_hour": 1800,
        "capacity": 25,
        "image_url": "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800",
        "location": "Karen, Nairobi",
        "max_capacity": 25,
        "operating_hours": "9:00 AM - 9:00 PM",
        "is_active": True
    },
    {
        "name": "Upper Hill Executive Suite",
        "description": "Luxury boardroom with video conferencing, presentation tools, and executive seating. Designed for high-level business meetings.",
        "price_per_hour": 3500,
        "capacity": 20,
        "image_url": "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800",
        "location": "Upper Hill, Nairobi",
        "max_capacity": 20,
        "operating_hours": "6:00 AM - 11:00 PM (Weekdays)",
        "is_active": True
    },
    {
        "name": "Lavington Green Gardens",
        "description": "Beautiful garden restaurant with outdoor seating, fountain, and catering kitchen. Perfect for brunches, parties, and photoshoots.",
        "price_per_hour": 4200,
        "capacity": 80,
        "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800",
        "location": "Lavington, Nairobi",
        "max_capacity": 80,
        "operating_hours": "6:00 AM - 11:00 PM",
        "is_active": True
    },

    # NEW SPACES
    {
        "name": "Conference Room",
        "description": "Professional conference room with presentation equipment, whiteboard, and comfortable seating for business meetings.",
        "price_per_hour": 85,
        "capacity": 20,
        "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800",
        "location": "Kileleshwa, Nairobi",
        "max_capacity": 20,
        "operating_hours": "8:00 AM - 8:00 PM Daily",
        "is_active": True
    },
    {
        "name": "Art Studio",
        "description": "Creative space with natural lighting, easels, and art supplies. Perfect for painting classes and creative workshops.",
        "price_per_hour": 45,
        "capacity": 10,
        "image_url": "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800",
        "location": "Nairobi",
        "max_capacity": 10,
        "operating_hours": "9:00 AM - 9:00 PM",
        "is_active": True
    },
    {
        "name": "Meeting Pod",
        "description": "Compact private meeting pod with soundproofing and basic amenities for small team discussions.",
        "price_per_hour": 30,
        "capacity": 6,
        "image_url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800",
        "location": "Nairobi",
        "max_capacity": 6,
        "operating_hours": "7:00 AM - 10:00 PM",
        "is_active": True
    },
    {
        
    "name": "Parklands Photography Studio",
    "description": "Professional photography studio with multiple backdrops, lighting equipment, and changing rooms. Ideal for photoshoots and video production.",
    "price_per_hour": 2800,
    "capacity": 15,
    "image_url": "https://listingster.com/wp-content/uploads/2024/10/Photoshoot-Studios-in-Kasarani-577x385.jpg",  # UPDATED
    "location": "Parklands, Nairobi",
    "max_capacity": 15,
    "operating_hours": "8:00 AM - 8:00 PM",
    "is_active": True
},
 
]

def seed_spaces():
    """Add sample spaces to database"""
    from app import create_app, db
    from app.models import Space
    
    app = create_app()
    with app.app_context():
        # Check if spaces already exist
        existing_count = Space.query.count()
        if existing_count > 0:
            print(f"Database already has {existing_count} spaces")
            return
        
        # Add all spaces
        for space_data in sample_spaces:
            space = Space(**space_data)
            db.session.add(space)
        
        db.session.commit()
        print(f"✅ Added {len(sample_spaces)} spaces to database")

if __name__ == "__main__":
    seed_spaces()

def seed_spaces():
    """Add sample spaces to database"""
    from app import create_app, db
    from app.models import Space
    
    app = create_app()
    with app.app_context():
        # Check if spaces already exist
        existing_count = Space.query.count()
        if existing_count > 0:
            print(f"Database already has {existing_count} spaces")
            return
        
        # Add all spaces
        for space_data in sample_spaces:
            space = Space(**space_data)
            db.session.add(space)
        
        db.session.commit()
        print(f"✅ Added {len(sample_spaces)} spaces to database")

if __name__ == "__main__":
    seed_spaces()

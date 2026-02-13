#!/usr/bin/env python3
"""
Seed script to automatically add sample spaces to the database.
Run this once to populate your database with sample spaces.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import Space

def seed_spaces():
    """Add sample spaces to the database"""
    
    # Nairobi sample spaces
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
        }
    ]
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        # Check if we need to add spaces
        existing_count = Space.query.count()
        print(f"📊 Current spaces in database: {existing_count}")
        
        if existing_count < 3:
            added_count = 0
            for space_data in sample_spaces:
                # Check if space already exists
                existing = Space.query.filter_by(name=space_data["name"]).first()
                if not existing:
                    space = Space(**space_data)
                    db.session.add(space)
                    added_count += 1
                    print(f"✓ Added: {space_data['name']}")
            
            if added_count > 0:
                db.session.commit()
                print(f"\n✅ Successfully added {added_count} new spaces!")
            else:
                print("✅ Database already has spaces")
        else:
            print("✅ Database already has enough spaces")
        
        # Show total count
        total = Space.query.count()
        print(f"📊 Total spaces in database: {total}")

if __name__ == "__main__":
    seed_spaces()

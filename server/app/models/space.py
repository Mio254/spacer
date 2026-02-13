from datetime import datetime
from app.extensions import db


class Space(db.Model):
    __tablename__ = "spaces"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price_per_hour = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500))
    capacity = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Optional fields you added earlier
    location = db.Column(db.String(200))
    max_capacity = db.Column(db.Integer)
    operating_hours = db.Column(db.String(100))
    amenities = db.Column(db.Text)  # Comma-separated amenities

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price_per_hour": self.price_per_hour,
            "image_url": self.image_url,
            "capacity": self.capacity,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "location": self.location,
            "max_capacity": self.max_capacity,
            "operating_hours": self.operating_hours,
            "amenities": self.amenities,
        }

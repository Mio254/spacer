from datetime import datetime, timezone
from app.extensions import db


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)

    
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    space_id = db.Column(db.Integer, db.ForeignKey("spaces.id"), nullable=False, index=True)

    
    start_time = db.Column(db.DateTime, nullable=False, index=True)
    end_time = db.Column(db.DateTime, nullable=False, index=True)

    
    duration = db.Column(db.Integer, nullable=False)  
    total_cost = db.Column(db.Integer, nullable=False)  

    status = db.Column(db.String(20), nullable=False, default="confirmed")  

    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )

    
    user = db.relationship("User", backref=db.backref("bookings", lazy=True))
    space = db.relationship("Space", backref=db.backref("bookings", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "space_id": self.space_id,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "duration": self.duration,
            "total_cost": self.total_cost,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }

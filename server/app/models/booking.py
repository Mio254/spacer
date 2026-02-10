from datetime import datetime, timezone
from app.extensions import db


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)

    # Strongly recommended: real foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    space_id = db.Column(db.Integer, db.ForeignKey("spaces.id"), nullable=False, index=True)

    # Use DateTime for real booking logic (overlaps, sorting, filtering)
    start_time = db.Column(db.DateTime, nullable=False, index=True)
    end_time = db.Column(db.DateTime, nullable=False, index=True)

    # Store duration in minutes (or hours) consistently
    duration = db.Column(db.Integer, nullable=False)  # minutes (recommended)
    total_cost = db.Column(db.Integer, nullable=False)  # use Integer cents or smallest currency unit

    status = db.Column(db.String(20), nullable=False, default="confirmed")  # confirmed|cancelled

    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )

    # Optional relationships (only if you have User/Space models with matching tablenames)
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

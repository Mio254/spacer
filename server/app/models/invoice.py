from datetime import datetime, timezone
from app.extensions import db


class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)

    booking_id = db.Column(
        db.Integer, db.ForeignKey("bookings.id"), nullable=False, index=True, unique=True
    )
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    amount_minor = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="kes")

    status = db.Column(db.String(20), nullable=False, default="paid")  # issued|paid|void
    issued_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    due_at = db.Column(db.DateTime, nullable=True)

    booking = db.relationship("Booking", backref=db.backref("invoice", uselist=False))
    user = db.relationship("User", backref=db.backref("invoices", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "user_id": self.user_id,
            "amount_minor": self.amount_minor,
            "currency": self.currency,
            "status": self.status,
            "issued_at": self.issued_at.isoformat(),
            "due_at": self.due_at.isoformat() if self.due_at else None,
        }

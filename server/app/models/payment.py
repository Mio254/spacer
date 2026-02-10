from datetime import datetime
from app.extensions import db

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)

    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default="usd")
    status = db.Column(db.String(20), nullable=False, default="unpaid")

    stripe_payment_intent_id = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

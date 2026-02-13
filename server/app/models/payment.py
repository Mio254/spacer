from datetime import datetime, timezone
from app.extensions import db


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)

    booking_id = db.Column(
        db.Integer, db.ForeignKey("bookings.id"), nullable=False, index=True
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )

    # Store money in smallest unit (KES cents). For KES 1,500.00 => 150000
    amount_minor = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="kes")

    status = db.Column(
        db.String(30),
        nullable=False,
        default="requires_payment_method",
    )
    # typical statuses:
    # requires_payment_method | requires_confirmation | processing | succeeded | canceled | failed

    stripe_payment_intent_id = db.Column(db.String(255), nullable=False, unique=True, index=True)

    # Optional: link to invoice once created
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"), nullable=True, index=True)

    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )

    booking = db.relationship("Booking", backref=db.backref("payments", lazy=True))
    user = db.relationship("User", backref=db.backref("payments", lazy=True))
    invoice = db.relationship("Invoice", backref=db.backref("payment", uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "user_id": self.user_id,
            "amount_minor": self.amount_minor,
            "currency": self.currency,
            "status": self.status,
            "stripe_payment_intent_id": self.stripe_payment_intent_id,
            "invoice_id": self.invoice_id,
            "created_at": self.created_at.isoformat(),
        }

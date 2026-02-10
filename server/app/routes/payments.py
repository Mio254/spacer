from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Payment, Booking

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@payments_bp.post("/create-intent")
@jwt_required()
def create_payment_intent():
    data = request.get_json(silent=True) or {}
    booking_id = data.get("booking_id")

    if not booking_id:
        return jsonify({"error": "booking_id required"}), 400

    booking = db.session.get(Booking, int(booking_id))
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    amount = booking.total_cost  # source of truth

    mock_intent_id = f"pi_mock_{booking.id}"
    mock_client_secret = f"{mock_intent_id}_secret"

    existing = Payment.query.filter_by(stripe_payment_intent_id=mock_intent_id).first()
    if not existing:
        payment = Payment(
            booking_id=booking.id,
            amount=float(amount),
            currency="usd",
            status="unpaid",
            stripe_payment_intent_id=mock_intent_id,
        )
        db.session.add(payment)
        db.session.commit()

    return jsonify({"client_secret": mock_client_secret, "payment_intent_id": mock_intent_id}), 200


@payments_bp.post("/confirm/<payment_intent_id>")
@jwt_required()
def confirm_payment(payment_intent_id: str):
    payment = Payment.query.filter_by(stripe_payment_intent_id=payment_intent_id).first()
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    booking = db.session.get(Booking, payment.booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    payment.status = "paid"
    db.session.commit()

    return jsonify({"message": "Payment confirmed (mock)", "status": payment.status}), 200

import stripe
from stripe import StripeError
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Payment, Booking, Invoice

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


def _init_stripe():
    secret = current_app.config.get("STRIPE_SECRET_KEY")
    if not secret:
        raise RuntimeError("STRIPE_SECRET_KEY not configured")
    stripe.api_key = secret


@payments_bp.post("/create-intent")
@jwt_required()
def create_payment_intent():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    booking_id = data.get("booking_id")

    if not booking_id:
        return jsonify({"error": "booking_id required"}), 400

    booking = db.session.get(Booking, int(booking_id))
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    if booking.status == "cancelled":
        return jsonify({"error": "Booking is cancelled"}), 409

    # If already invoiced, treat as paid
    existing_invoice = Invoice.query.filter_by(booking_id=booking.id, user_id=user_id).first()
    if existing_invoice:
        # Optional: keep payment table consistent (best-effort)
        try:
            existing_payment = (
                Payment.query.filter_by(booking_id=booking.id, user_id=user_id)
                .order_by(Payment.created_at.desc())
                .first()
            )
            if existing_payment:
                existing_payment.status = "succeeded"
                existing_payment.invoice_id = existing_invoice.id
                db.session.commit()
        except Exception:
            db.session.rollback()
        return jsonify({"message": "Already paid", "invoice_id": existing_invoice.id, "client_secret": None}), 200

    _init_stripe()

    # booking.total_cost is major KES (e.g. 1500)
    try:
        amount_kes = int(booking.total_cost)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid booking total_cost"}), 500

    if amount_kes <= 0:
        return jsonify({"error": "Invalid booking amount"}), 400

    amount_minor = amount_kes * 100
    currency = "kes"

    # Create Stripe intent
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_minor,
            currency=currency,
            metadata={"booking_id": str(booking.id), "user_id": str(user_id)},
            automatic_payment_methods={"enabled": True},
        )
    except StripeError as e:
        current_app.logger.exception("Stripe error creating PaymentIntent")
        msg = getattr(e, "user_message", None) or str(e)
        return jsonify({"error": msg}), 502
    except Exception:
        current_app.logger.exception("Unknown error creating PaymentIntent")
        return jsonify({"error": "Failed to create payment intent"}), 502

    # Persist Payment record
    try:
        existing = (
            Payment.query.filter_by(booking_id=booking.id, user_id=user_id)
            .order_by(Payment.created_at.desc())
            .first()
        )

        if existing and existing.status != "succeeded":
            existing.amount_minor = amount_minor
            existing.currency = currency
            existing.status = intent.status
            existing.stripe_payment_intent_id = intent.id
            existing.invoice_id = None
        else:
            payment = Payment(
                booking_id=booking.id,
                user_id=user_id,
                amount_minor=amount_minor,
                currency=currency,
                status=intent.status,
                stripe_payment_intent_id=intent.id,
                invoice_id=None,
            )
            db.session.add(payment)

        db.session.commit()

        return jsonify({"client_secret": intent.client_secret, "payment_intent_id": intent.id}), 201

    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to persist payment record")
        return jsonify({"error": "Failed to persist payment record"}), 500


@payments_bp.post("/confirm/<payment_intent_id>")
@jwt_required()
def confirm_payment(payment_intent_id: str):
    user_id = int(get_jwt_identity())
    _init_stripe()

    # Stripe source of truth
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    except StripeError as e:
        msg = getattr(e, "user_message", None) or str(e)
        return jsonify({"error": msg}), 502
    except Exception:
        current_app.logger.exception("Failed to retrieve payment intent")
        return jsonify({"error": "Failed to retrieve payment intent"}), 502

    if intent.status != "succeeded":
        return jsonify({"error": f"Payment not completed (status={intent.status})"}), 409

    payment = Payment.query.filter_by(stripe_payment_intent_id=payment_intent_id).first()
    if not payment:
        return jsonify({"error": "Payment record not found"}), 404

    booking = db.session.get(Booking, payment.booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    # Idempotency: invoice already exists
    existing_invoice = Invoice.query.filter_by(booking_id=booking.id, user_id=user_id).first()
    if existing_invoice:
        try:
            payment.status = "succeeded"
            payment.invoice_id = existing_invoice.id
            db.session.commit()
            return jsonify({"message": "Already confirmed", "invoice_id": existing_invoice.id}), 200
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Failed to update payment state")
            return jsonify({"error": "Failed to update payment state"}), 500

    # Create invoice + link it
    try:
        invoice = Invoice(
            booking_id=booking.id,
            user_id=user_id,
            amount_minor=payment.amount_minor,
            currency=payment.currency or "kes",
            status="paid",
        )

        payment.status = "succeeded"

        db.session.add(invoice)
        db.session.flush()  # invoice.id

        payment.invoice_id = invoice.id

        db.session.commit()

        return jsonify({"message": "Payment confirmed", "invoice_id": invoice.id}), 201

    except Exception:
        db.session.rollback()
        current_app.logger.exception("Payment confirmation failed")
        return jsonify({"error": "Payment confirmation failed"}), 500

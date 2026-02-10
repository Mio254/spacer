import stripe
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.payment import Payment
from app.models.booking import Booking


payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/create-intent', methods=['POST'])
@jwt_required()
def create_payment_intent():
    data = request.get_json()
    booking_id = data.get('booking_id')
    amount = data.get('amount')  # amount in cents

    if not booking_id or not amount:
        return jsonify({"error": "booking_id and amount required"}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    # Mock payment intent for testing (replace with real Stripe when configured)
    mock_client_secret = f"pi_mock_{booking_id}_{amount}_secret"

    payment = Payment(
        booking_id=booking_id,
        amount=amount / 100,  # convert to dollars
        stripe_payment_intent_id=f"pi_mock_{booking_id}"
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({'client_secret': mock_client_secret}), 200

@payments_bp.route('/confirm/<payment_intent_id>', methods=['POST'])
@jwt_required()
def confirm_payment(payment_intent_id):
    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        if intent.status == 'succeeded':
            payment = Payment.query.filter_by(stripe_payment_intent_id=payment_intent_id).first()
            if payment:
                payment.status = 'paid'
                booking = Booking.query.get(payment.booking_id)
                if booking:
                    booking.payment_status = 'paid'
                db.session.commit()
                return jsonify({"message": "Payment confirmed"}), 200
            else:
                return jsonify({"error": "Payment not found"}), 404
        else:
            return jsonify({"error": "Payment not completed"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
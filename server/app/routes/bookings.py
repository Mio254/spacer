from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Booking

bookings_bp = Blueprint('bookings', __name__)

# Assuming other booking endpoints exist, adding payment status update

@bookings_bp.route('/<int:booking_id>/payment-status', methods=['PUT'])
@jwt_required()
def update_payment_status(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404 commi

    # Allow admin or the user
    current_user = int(get_jwt_identity())
    # Assuming User model has role, but for simplicity, check if user_id matches or admin
    if booking.user_id != current_user:
        # In real app, check role
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    status = data.get('payment_status')
    if status not in ['unpaid', 'paid', 'refunded']:
        return jsonify({"error": "Invalid status"}), 400 

    booking.payment_status = status
    db.session.commit()

    return jsonify({"message": "Payment status updated"}), 200 


